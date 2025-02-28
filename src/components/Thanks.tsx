import { memo } from "react"
import { type ThankT } from "../hooks/useThanksATonContract"
import Thank from "./Thank"

function Thanks({ thanks }: { thanks: ThankT[] }) {
  return (
    <ul className='Thanks'>
      {
        thanks.map(thank => (
          <Thank key={thank.hash} thank={thank} />
        ))
      }
    </ul>
  )
}

export default memo(Thanks)
