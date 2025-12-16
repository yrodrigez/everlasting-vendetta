import { getRoleIcon } from "@/app/apply/components/utils";
import { PLAYABLE_ROLES } from "@/app/util/constants";
import { useEffect, useMemo } from "react";
import { Button } from "../Button";
import { isRoleAssignable } from "../ProfileManager";
import { useCharacterStore } from "../characterStore";

export function Role({ role, size = "md" }: { role: string, size?: "sm" | "md" | "lg" }) {
    return (
        <span className={`relative ${size === 'sm' ? 'min-w-4 max-w-8 h-4' : size === 'md' ? 'min-w-6 max-w-12 h-6' : 'min-w-8 max-w-16 h-8'} group`}>
            {role.split('-').map((roleValue, i, arr) => (
                <img
                    key={i}
                    className={`
                                        absolute top-0 ${(i === 0 && arr.length === 1) ? 'left-0' : (i === 0 && arr.length > 1) ? '-left-1.5' : 'left-2.5'}
                                        ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'}
                                        rounded-full border border-gold
                                        
                                    `}
                    src={getRoleIcon(roleValue)}
                    alt={roleValue}
                />
            ))}
        </span>
    );
}

export function RoleSelection() {

    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const setRole = useCharacterStore(state => state.setRole);
    const assignableRoles = useMemo(() => {
        return Object.values(PLAYABLE_ROLES).filter(role => role.value.split('-').every((x: string) => isRoleAssignable(x.toLowerCase(), selectedCharacter?.playable_class?.name?.toLowerCase(), selectedCharacter?.realm?.slug ?? 'living-flame')));
    }, [selectedCharacter])

    useEffect(() => {
        if (assignableRoles.length === 1 && selectedCharacter?.selectedRole !== assignableRoles[0].value) {
            setRole(assignableRoles[0].value)
        }
    }, [assignableRoles])


    return (
        <div>
            {selectedCharacter && (
                <div
                    className="flex w-full items-center gap-4 mx-auto mb-2 ml-12"
                >
                    <div
                        className={`min-w-10 min-h-10 rounded-full border-2 border-${selectedCharacter.playable_class?.name?.toLowerCase()} bg-cover bg-center bg-no-repeat`}
                        style={{ backgroundImage: `url(${selectedCharacter.avatar})` }}
                    />
                    <div className="flex flex-col grow">
                        <span className={`text-lg capitalize font-semibold text-${selectedCharacter.playable_class?.name?.toLowerCase()}`}>{selectedCharacter.name}</span>
                        <span className="text-sm text-wood-50">
                            Level {selectedCharacter.level} {selectedCharacter.playable_class?.name}
                        </span>
                        <span className="text-xs tracking-wide text-wood-200 capitalize">
                            {selectedCharacter.realm.slug}
                        </span>
                    </div>
                </div>
            )}
            <div className="grid gap-2">
                <div
                    className="flex gap-2 p-2 w-full flex-wrap justify-center items-center">
                    {Object.values(PLAYABLE_ROLES).map(
                        (role, i) => {
                            const isDisabled = assignableRoles.findIndex(r => r.value === role.value) === -1;
                            return (
                                <Button
                                    key={i}
                                    size="lg"
                                    isDisabled={isDisabled}
                                    className={
                                        `bg-moss opacity-100 text-gold rounded border border-moss-100 relative hover:bg-dark hover:border-dark-100 `
                                        + ` ${selectedCharacter?.selectedRole === role.value ? 'bg-dark text-gold border-gold' : ''}`
                                        + ` ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`
                                    }
                                    onPress={() => {
                                        if (selectedCharacter?.selectedRole !== role.value) setRole(role.value)
                                    }}
                                >
                                    <Role role={role.value} />
                                </Button>
                            )
                        }
                    )}
                </div>
            </div>
        </div>
    );
}