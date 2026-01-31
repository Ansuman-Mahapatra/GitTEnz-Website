import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Code2, Rocket, Trophy } from "lucide-react";

interface OnboardingData {
    role: string;
    experience: string;
    primaryLanguage: string;
    goal: string;
}

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: (data: OnboardingData) => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<OnboardingData>({
        role: "",
        experience: "",
        primaryLanguage: "",
        goal: "",
    });

    const totalSteps = 4;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            onClose(data);
        }
    };

    const updateData = (key: keyof OnboardingData, value: string) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-primary/20">
                <div className="bg-primary/10 p-6 flex flex-col items-center justify-center space-y-2 border-b border-white/5">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-2">
                        {step === 1 && <Rocket size={24} />}
                        {step === 2 && <Code2 size={24} />}
                        {step === 3 && <Trophy size={24} />}
                        {step === 4 && <CheckCircle2 size={24} />}
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center">
                        {step === 1 && "Welcome to GitTEnz!"}
                        {step === 2 && "Tell us about you"}
                        {step === 3 && "Your Tech Stack"}
                        {step === 4 && "Set your Goal"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        Step {step} of {totalSteps}
                    </DialogDescription>
                </div>

                <div className="p-6 min-h-[300px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4 flex-1"
                            >
                                <p className="text-center text-lg mb-6">Let's personalize your dashboard experience. What describes you best?</p>
                                <RadioGroup onValueChange={(v) => updateData("role", v)} value={data.role} className="grid grid-cols-2 gap-4">
                                    {['Student', 'Professional', 'Hobbyist', 'Freelancer'].map((role) => (
                                        <div key={role}>
                                            <RadioGroupItem value={role} id={role} className="peer sr-only" />
                                            <Label
                                                htmlFor={role}
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all cursor-pointer text-center h-full"
                                            >
                                                {role}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 flex-1 flex flex-col justify-center"
                            >
                                <div className="space-y-4">
                                    <Label className="text-lg">What is your coding experience?</Label>
                                    <RadioGroup onValueChange={(v) => updateData("experience", v)} value={data.experience} className="space-y-3">
                                        <div className="flex items-center space-x-3 space-y-0">
                                            <RadioGroupItem value="beginner" id="r1" />
                                            <Label htmlFor="r1" className="font-normal text-base">Beginner (Started learning recently)</Label>
                                        </div>
                                        <div className="flex items-center space-x-3 space-y-0">
                                            <RadioGroupItem value="intermediate" id="r2" />
                                            <Label htmlFor="r2" className="font-normal text-base">Intermediate (Building projects)</Label>
                                        </div>
                                        <div className="flex items-center space-x-3 space-y-0">
                                            <RadioGroupItem value="advanced" id="r3" />
                                            <Label htmlFor="r3" className="font-normal text-base">Advanced (Professional dev)</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 flex-1 flex flex-col justify-center"
                            >
                                <div className="space-y-4">
                                    <Label className="text-lg">What is your primary language?</Label>
                                    <Select onValueChange={(v) => updateData("primaryLanguage", v)} value={data.primaryLanguage}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="javascript">JavaScript / TypeScript</SelectItem>
                                            <SelectItem value="python">Python</SelectItem>
                                            <SelectItem value="java">Java</SelectItem>
                                            <SelectItem value="csharp">C# / .NET</SelectItem>
                                            <SelectItem value="go">Go</SelectItem>
                                            <SelectItem value="rust">Rust</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">This helps us customize your code editor feedback.</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 flex-1 flex flex-col justify-center"
                            >
                                <div className="space-y-4">
                                    <Label className="text-lg">What is your main goal?</Label>
                                    <RadioGroup onValueChange={(v) => updateData("goal", v)} value={data.goal} className="grid grid-cols-1 gap-3">
                                        {[
                                            { val: 'manage', label: 'Manage my repositories better' },
                                            { val: 'learn', label: 'Learn from my code patterns' },
                                            { val: 'collaborate', label: 'Improve team collaboration' },
                                            { val: 'productivity', label: 'Boost my productivity' }
                                        ].map((item) => (
                                            <div key={item.val} className="relative">
                                                <RadioGroupItem value={item.val} id={item.val} className="peer sr-only" />
                                                <Label
                                                    htmlFor={item.val}
                                                    className="flex items-center w-full p-4 border rounded-lg hover:bg-accent cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-colors"
                                                >
                                                    {item.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="p-6 bg-secondary/20 flex justify-between w-full border-t border-white/5">
                    <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 1}>Back</Button>
                    <Button
                        onClick={handleNext}
                        disabled={
                            (step === 1 && !data.role) ||
                            (step === 2 && !data.experience) ||
                            (step === 3 && !data.primaryLanguage) ||
                            (step === 4 && !data.goal)
                        }
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        {step === totalSteps ? "Finish Setup" : "Next Step"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
