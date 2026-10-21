Node: 1110:8853 features__ramp-counter (file tF23PDdcgeTKK5hsmDZIKg), get_motion_context recursive:true, screenshot: ramp.png (234x128)
Cycle length: not given for this node (no timelineCohorts in the answer); the node's track uses duration 11.18 s, the same cycle as the other Features cards (root cohort 1110:8484, 11180 ms).
Cut at cycle end: unlikely to matter here (motion ends at 0.1073 * 11.18 = 1.2 s, then holds at -640 until the end), but the loop reset jumps back to y 0 with no return animation, so a "reset" phase may have been lost.

Raw answer (unchanged):

```json
{"nodes":[{"nodeId":"1110:8855","nodeName":"features__ramp-counter-scroll","nodeType":"FRAME","codeSnippets":{"motionDev":"<motion.div initial={{ y: 0, }} animate={{ y: [0, -640, -640], }} transition={{ y: { duration: 11.18, times: [0, 0.1073, 1], ease: [[0.25, 1, 0.5, 1], \"linear\"], repeat: Infinity }, }} />"}}]}
```
