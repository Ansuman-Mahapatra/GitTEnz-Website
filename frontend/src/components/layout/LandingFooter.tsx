import { GitBranch } from "lucide-react";
import { Link } from "react-router-dom";

export function LandingFooter() {
    return (
        <footer className="py-12 border-t border-border/40 bg-muted/20 relative z-10 w-full overflow-hidden">
            <div className="container px-6 mx-auto relative z-10">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <GitBranch className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold">GitTEnz</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Modern GitHub dashboard with AI-powered insights and enterprise security.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link to="/download" className="hover:text-primary transition-colors">Download App</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-border/40 text-center text-muted-foreground">
                    <p className="font-medium">© 2026 GitTEnz. All rights reserved.</p>
                    <p className="mt-2 text-sm opacity-70">
                        Built with ❤️ by <span className="text-primary hover:underline cursor-pointer">Ansuman Mahapatra</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
