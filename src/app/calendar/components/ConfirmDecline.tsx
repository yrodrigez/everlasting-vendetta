import {Button} from "@nextui-org/react";
import {LoadingIcon} from "@/app/components/LoadingIcon";
import {useRouter} from "next/navigation";


export function ConfirmDecline({
                                   id,
                                   isConfirming,
                                   isDeclining,
                                   setIsConfirming,
                                   setIsDeclining,
                                   confirmRaid,
                                   loggedInUser,
                                   currentCharacter,
                                   isCharMaxLevel,
                                   CURRENT_MAX_LEVEL,
                                   isConfirmed,
                                   isDeclined
                               }: {
    id: string,
    isConfirming: boolean,
    isDeclining: boolean,
    setIsConfirming: (value: boolean) => void,
    setIsDeclining: (value: boolean) => void,
    confirmRaid: (id: string, isConfirmed: boolean, currentCharacter: any) => Promise<any>,
    loggedInUser: any,
    currentCharacter: any,
    isCharMaxLevel: boolean,
    CURRENT_MAX_LEVEL: number,
    isConfirmed: boolean,
    isDeclined: boolean
}) {
    const router = useRouter()
    return (
        <div className="flex flex-row justify-between w-full">
            <Button
                isIconOnly={isConfirming}
                onClick={() => {
                    router.push(`/raid/${id}`)
                }}

                className="w-full bg-moss hover:bg-moss-600 text-gold font-bold"
            >
               Open
            </Button>
        </div>
    );
}
