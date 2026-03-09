import { Button } from "@/app/components/Button";
import { Popover, PopoverContent, PopoverTrigger, useDisclosure, MenuItem } from "@heroui/react";
import { UserRoundCog, XIcon } from "lucide-react";

export default function AdminActions({ children }: { children: React.ReactNode }) {
    const { isOpen, onOpenChange } = useDisclosure();
    return (
        <Popover isOpen={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger>
                <Button isIconOnly size="sm" variant="light" className="ml-auto text-default">
                    {isOpen ? <XIcon /> : <UserRoundCog />}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="px-2 py-3 flex flex-col gap-2 border border-wood-100 grow flex-1"
            >
                {children}
            </PopoverContent>
        </Popover>
    );
}
