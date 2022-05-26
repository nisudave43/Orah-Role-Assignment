import React, { useState } from "react"
import { RolllStateType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"

interface Props {
  initialState?: RolllStateType
  size?: number
  onStateChange?: (id: any ,newState: RolllStateType) => void,
  student: any
}
export const RollStateSwitcher: React.FC<Props> = ({ initialState = "unmark", size = 40, onStateChange, student }) => {
  const [rollState, setRollState] = useState(student?. attendance || initialState)

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    const next = nextState();
    setRollState(next)
    if (onStateChange) {
      onStateChange(student?.id, next)
    }
  }

  return <RollStateIcon type={rollState} size={size} onClick={onClick} />
}
