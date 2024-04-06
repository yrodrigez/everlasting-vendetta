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
            {(!loggedInUser || !currentCharacter) && <div
              className="absolute top-0 bottom-0 z-10 left-1 right-1 flex justify-center items-center backdrop-filter backdrop-blur-sm rounded-xl">
              <h3 className="text-gold">Please login to confirm or decline</h3>
            </div>}
            {!isCharMaxLevel && currentCharacter && <div
              className="absolute top-0 bottom-0 z-10 left-1 right-1 flex justify-center items-center backdrop-filter backdrop-blur-md rounded-xl p-2 bg-red-500">
              <h3 className="text-wood font-bold">You need to be level {CURRENT_MAX_LEVEL} to confirm</h3>
            </div>}
            <Button
                isIconOnly={isDeclining}
                onClick={() => {
                    if (!currentCharacter) return
                    if (!isCharMaxLevel) return
                    setIsDeclining(true)
                    confirmRaid(id, false, currentCharacter).then(() => {
                        setIsDeclining(false)
                        router.refresh()
                    })
                }}
                isDisabled={!currentCharacter || isDeclining || isDeclined || !isCharMaxLevel}
                className="w-20 bg-red-600 hover:bg-red-700 text-gold font-bold"
            >
                {isDeclining ? <LoadingIcon/> : isDeclined ? 'Declined' : 'Decline'}
            </Button>
            <Button
                isIconOnly={isConfirming}
                onClick={() => {
                    if (!currentCharacter) return
                    if (!isCharMaxLevel) return
                    setIsConfirming(true)
                    confirmRaid(id, true, currentCharacter).then(() => {
                        setIsConfirming(false)
                        router.refresh()
                    })
                }}
                isDisabled={!currentCharacter || isConfirming || isConfirmed || !isCharMaxLevel}
                className="w-20 bg-moss hover:bg-moss-600 text-gold font-bold"
            >
                {isConfirming ? <LoadingIcon/> : isConfirmed ? 'Confirmed' : 'Confirm'}
            </Button>
        </div>
    );
}
