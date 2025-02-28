import { memo } from "react";
import { type ThankT } from "../hooks/useThanksATonContract";

function Thank({ thank }: { thank: ThankT}) {
  return <li>"{thank.message}" with {thank.value} 💎 </li>
}

export default memo(Thank);
