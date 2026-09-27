import type StateInline from '../rules_inline/state_inline.ts'

/** Finds the end of a link or image label (`[label]`). */
export default function parseLinkLabel (state: StateInline, start: number, disableNested?: boolean, maxLength = 0): number {
  let level, found, marker, prevPos

  const max = state.posMax
  const oldPos = state.pos

  state.pos = start + 1
  level = 1

  while (state.pos < max) {
    if (maxLength && state.pos - start > maxLength + 1) {
      state.pos = oldPos
      return -1
    }

    marker = state.src.charCodeAt(state.pos)
    if (marker === 0x5D /* ] */) {
      level--
      if (level === 0) {
        found = true
        break
      }
    }

    prevPos = state.pos
    state.md.inline.skipToken(state)
    if (maxLength && state.pos - start > maxLength + 1) {
      state.pos = oldPos
      return -1
    }

    if (marker === 0x5B /* [ */) {
      if (prevPos === state.pos - 1) {
        // increase level if we find text `[`, which is not a part of any token
        level++
      } else if (disableNested) {
        state.pos = oldPos
        return -1
      }
    }
  }

  let labelEnd = -1

  if (found) {
    labelEnd = state.pos
  }

  // restore old state
  state.pos = oldPos

  return labelEnd
}
