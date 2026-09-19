import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

// Single registration point — plugins are registered exactly once per bundle.
gsap.registerPlugin(useGSAP, ScrollTrigger)

// STEP 2 freeze fix: mobile URL-bar show/hide fires resize on every scroll,
// and each resize triggers a full ScrollTrigger.refresh() (100-300ms layout
// on phones). Ignoring it removes the scroll-jank storm; rotation/resize still
// refresh via refreshRoute() and the home two-frame gate.
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger, useGSAP }
