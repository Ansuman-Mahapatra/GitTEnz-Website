"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
    /** Increase/Decrease animation intensity (0.5..2) */
    intensity?: number;
};

export default function ThemeSwitchFlowGlass({
    className,
    intensity = 1,
    ...props
}: Props) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [checked, setChecked] = useState(false);

    // Motion preference
    const prefersReducedMotion = useMemo(
        () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
        [],
    );

    // WebGL refs
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const progRef = useRef<WebGLProgram | null>(null);
    const glRef = useRef<WebGL2RenderingContext | null>(null);
    const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
    const vboRef = useRef<WebGLBuffer | null>(null);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number>(0);
    const hoverRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
    const uniforms = useRef<{
        res?: WebGLUniformLocation | null;
        time?: WebGLUniformLocation | null;
        theme?: WebGLUniformLocation | null;
        mouse?: WebGLUniformLocation | null;
        power?: WebGLUniformLocation | null;
    }>({});

    useEffect(() => setMounted(true), []);
    useEffect(() => setChecked(resolvedTheme === "dark"), [resolvedTheme]);

    const onChange = useCallback(
        (v: boolean) => {
            setChecked(v);
            setTheme(v ? "dark" : "light");
        },
        [setTheme],
    );

    // track mouse for parallax
    useEffect(() => {
        if (!mounted) return;
        const el = canvasRef.current?.parentElement;
        if (!el) return;

        const onMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / Math.max(1, r.width);
            const y = (e.clientY - r.top) / Math.max(1, r.height);
            hoverRef.current.x += (x - hoverRef.current.x) * 0.25;
            hoverRef.current.y += (y - hoverRef.current.y) * 0.25;
        };
        const onLeave = () => {
            hoverRef.current.x += (0.5 - hoverRef.current.x) * 0.25;
            hoverRef.current.y += (0.5 - hoverRef.current.y) * 0.25;
        };

        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
        };
    }, [mounted]);

    // --- WebGL setup ---
    useEffect(() => {
        if (!mounted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl2", { antialias: true, premultipliedAlpha: true });
        if (!gl) return; // graceful fallback
        glRef.current = gl;

        const vertSrc = `#version 300 es
      precision highp float;
      layout(location=0) in vec2 a_pos;
      out vec2 v_uv;
      void main(){
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

        // Dynamic flow/noise shader (no rainbow gradient):
        // - fbm noise warped by a curl-like field
        // - Desaturated base; slight theme hue shift (cooler in dark, warmer in light)
        // - Parallax via iMouse
        const fragSrc = `#version 300 es
      precision highp float;
      out vec4 fragColor;
      in vec2 v_uv;

      uniform vec2  iResolution;
      uniform float iTime;
      uniform int   iTheme; // 0 light, 1 dark
      uniform vec2  iMouse; // 0..1
      uniform float iPower; // user intensity

      // hash / noise / fbm
      float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p);
        float a=hash(i), b=hash(i+vec2(1.,0.));
        float c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
        vec2 u=f*f*(3.-2.*f);
        return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
      }
      float fbm(vec2 p){
        float s=0.0, a=0.5;
        for(int i=0;i<5;i++){
          s+=a*noise(p);
          p*=2.0; a*=0.5;
        }
        return s;
      }

      // pseudo curl by rotating gradient samples
      vec2 flow(vec2 p){
        float e=0.01;
        float n1 = fbm(p + vec2(0.0, 0.0));
        float nx = fbm(p + vec2(e, 0.0));
        float ny = fbm(p + vec2(0.0, e));
        vec2 g = vec2(nx-n1, ny-n1)/e;
        return vec2(-g.y, g.x);
      }

      vec3 tonemap(vec3 c){ return c/(c+vec3(1.0)); }

      void main(){
        vec2 res = iResolution;
        vec2 uv  = v_uv;

        // Parallax origin (mouse)
        vec2 m = iMouse;
        vec2 center = mix(vec2(0.5), m, 0.35);
        vec2 p = (uv - center);
        float ar = res.x/max(res.y,1.0);
        p.x *= ar;

        // base domain movement
        float t = iTime * (0.6 + 0.6*iPower);

        // warp position through flow field
        vec2 q = p * (2.2 + 0.2*iPower);
        q += 0.15 * flow(q + vec2(t*0.2, -t*0.17));
        q += 0.10 * flow(q*1.7 + vec2(-t*0.18, t*0.21));

        // two layers of fbm
        float f1 = fbm(q*2.0 + vec2(t*0.10, -t*0.13));
        float f2 = fbm(q*3.4 + vec2(-t*0.09, t*0.07));

        // Combine into desaturated "ink" pattern
        float ink = smoothstep(0.25, 0.85, 0.55*f1 + 0.45*f2);

        // Theme tints: subtle & desaturated
        vec3 tintLight = vec3(1.00, 0.96, 0.90); // warm ivory
        vec3 tintDark  = vec3(0.86, 0.92, 1.00); // cool ink
        vec3 base = mix(tintLight, tintDark, float(iTheme));

        // Ink color varies gently by theme
        vec3 colInk = mix(vec3(0.22,0.20,0.18), vec3(0.18,0.22,0.28), float(iTheme));
        vec3 colBg  = mix(vec3(0.97,0.98,1.00), vec3(0.10,0.12,0.16), float(iTheme));

        vec3 col = mix(colBg, mix(base, colInk, 0.35), ink);

        // add subtle specular sweep along horizontal
        float sweep = 0.25 + 0.25*sin(t*0.9 + uv.x*6.0 - uv.y*3.0);
        float h = smoothstep(0.03, 0.0, abs(length(p*vec2(1.2,1.8)) - sweep));
        vec3 spec = mix(vec3(1.0,0.95,0.85), vec3(0.80,0.88,1.0), float(iTheme));
        col += 0.15 * spec * h;

        // vignette
        float vig = smoothstep(0.78, 0.35, length(p));
        col *= mix(1.0, 0.93, vig);

        // final
        col = tonemap(col);
        fragColor = vec4(col, 0.88); // translucent for glass look
      }
    `;

        const compile = (type: number, src: string) => {
            const sh = gl.createShader(type)!;
            gl.shaderSource(sh, src);
            gl.compileShader(sh);
            if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                console.error("[FlowGlass] shader error:", gl.getShaderInfoLog(sh));
                gl.deleteShader(sh);
                return null;
            }
            return sh;
        };

        const vs = compile(gl.VERTEX_SHADER, vertSrc);
        const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
        if (!vs || !fs) return;

        const prog = gl.createProgram()!;
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.bindAttribLocation(prog, 0, "a_pos");
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error("[FlowGlass] link error:", gl.getProgramInfoLog(prog));
            gl.deleteProgram(prog);
            return;
        }
        gl.deleteShader(vs); gl.deleteShader(fs);
        progRef.current = prog;

        // quad
        const vao = gl.createVertexArray()!;
        gl.bindVertexArray(vao);
        vaoRef.current = vao;

        const vbo = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        vboRef.current = vbo;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        uniforms.current.res = gl.getUniformLocation(prog, "iResolution");
        uniforms.current.time = gl.getUniformLocation(prog, "iTime");
        uniforms.current.theme = gl.getUniformLocation(prog, "iTheme");
        uniforms.current.mouse = gl.getUniformLocation(prog, "iMouse");
        uniforms.current.power = gl.getUniformLocation(prog, "iPower");

        const resize = () => {
            const canvas = canvasRef.current!;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const rect = canvas.getBoundingClientRect();
            const w = Math.max(1, Math.floor(rect.width * dpr));
            const h = Math.max(1, Math.floor(rect.height * dpr));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w; canvas.height = h;
            }
            gl.viewport(0, 0, w, h);
        };

        let lastFrame = 0;
        const render = (ts: number) => {
            if (!progRef.current) return;

            // If reduced motion: freeze time (but still parallax slightly)
            if (!startRef.current) startRef.current = ts;
            const t = prefersReducedMotion ? 0 : (ts - startRef.current) / 1000;

            resize();
            gl.useProgram(progRef.current);
            gl.uniform2f(uniforms.current.res!, canvas.width, canvas.height);
            gl.uniform1f(uniforms.current.time!, t);
            gl.uniform1i(uniforms.current.theme!, resolvedTheme === "dark" ? 1 : 0);
            gl.uniform2f(uniforms.current.mouse!, hoverRef.current.x, hoverRef.current.y);
            gl.uniform1f(uniforms.current.power!, Math.max(0.5, Math.min(2, intensity)));

            // Optional: cap to ~60fps if browser is spiking
            const dt = ts - lastFrame; lastFrame = ts;
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            rafRef.current = requestAnimationFrame(render);
        };

        rafRef.current = requestAnimationFrame(render);
        const onResize = () => resize();
        window.addEventListener("resize", onResize);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", onResize);
            if (progRef.current) { gl.deleteProgram(progRef.current); progRef.current = null; }
            if (vboRef.current) { gl.deleteBuffer(vboRef.current); vboRef.current = null; }
            if (vaoRef.current) { gl.deleteVertexArray(vaoRef.current); vaoRef.current = null; }
            glRef.current = null;
        };
    }, [mounted, resolvedTheme, intensity, prefersReducedMotion]);

    if (!mounted) return null;

    return (
        <div
            className={cn(
                "relative flex h-10 w-24 select-none items-center justify-center",
                // subtle press/hover transforms for the WHOLE control
                "transition-transform duration-150 will-change-transform",
                "hover:scale-[1.02] active:scale-[0.99]",
                className
            )}
            {...props}
        >
            {/* Shader BACKGROUND, clipped to track */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
                <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
            </div>

            {/* Glass overlay: under thumb, above shader */}
            <div
                aria-hidden
                className={cn(
                    "absolute inset-0 rounded-full border backdrop-blur-md",
                    "border-white/25 bg-background/15",
                )}
                style={{ zIndex: 5 }}
            />

            {/* Real shadcn/ui Switch — track is transparent, only thumb visible */}
            <Switch
                checked={checked}
                onCheckedChange={onChange}
                className={cn(
                    "peer absolute inset-0 h-full w-full rounded-full",
                    "!bg-transparent data-[state=checked]:!bg-transparent data-[state=unchecked]:!bg-transparent",
                    "!border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    // Thumb geometry
                    "[&>span]:absolute [&>span]:top-1 [&>span]:left-1 [&>span]:h-8 [&>span]:w-8",
                    "[&>span]:rounded-full [&>span]:bg-background/85 [&>span]:shadow [&>span]:z-30",
                    // Thumb micro-interactions
                    "[&>span]:transition-transform [&>span]:duration-200",
                    "hover:[&>span]:scale-[1.02] active:[&>span]:scale-[0.98]",
                    // Travel
                    "data-[state=unchecked]:[&>span]:translate-x-0",
                    "data-[state=checked]:[&>span]:translate-x-[56px]"
                )}
                style={{ zIndex: 10 }}
            />

            {/* ICONS — perfectly centered on thumb stops */}
            <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-[20px] -translate-x-1/2 z-20 flex items-center"
            >
                <SunIcon
                    size={16}
                    className={cn(
                        "transition-all duration-300",
                        checked ? "opacity-45" : "opacity-100 rotate-12"
                    )}
                />
            </span>
            <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-[76px] -translate-x-1/2 z-20 flex items-center"
            >
                <MoonIcon
                    size={16}
                    className={cn(
                        "transition-all duration-300",
                        checked ? "opacity-100 -rotate-12" : "opacity-45"
                    )}
                />
            </span>
        </div>
    );
}
