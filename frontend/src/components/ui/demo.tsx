
import { EtheralShadow } from "@/components/ui/etheral-shadow";

const DemoOne = () => {
    return (
        <div className="flex w-full h-screen justify-center items-center bg-black overflow-hidden relative">
            <EtheralShadow
                color="#10b981"
                animation={{ scale: 80, speed: 40 }}
                noise={{ opacity: 0.5, scale: 1 }}
                sizing="fill"
                className="w-full h-full"
            />
        </div>
    );
};

export { DemoOne };
