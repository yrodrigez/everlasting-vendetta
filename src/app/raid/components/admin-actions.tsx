import { Button } from "@/app/components/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { UserRoundCog } from "lucide-react";

export default function AdminActions({ children }: { children: React.ReactNode }) {
    return (
        <Popover>
            <PopoverTrigger>
                <Button isIconOnly size="sm">
                    <UserRoundCog />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                {children}
            </PopoverContent>
        </Popover>
    );
}