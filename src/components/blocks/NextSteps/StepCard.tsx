import { motion, useTransform, type MotionValue } from 'motion/react'
import type { StepData } from './steps'

type StepCardProps = {
  step: StepData
  isActive: boolean
  /** Share of the step time that has passed (0 to 1); drives the orange line of the open card. */
  progress: MotionValue<number>
  /** Share of the line shown when nothing runs (reduced motion): the design shows it at 78 %. */
  staticProgress: number | null
  onOpen: () => void
}

/**
 * One step. Figma `next-steps__card-{id}` (`--active` open, `--closed` closed).
 * Closed: the number on top and the title at the bottom. Open: the card is wider and the text and the progress line
 * unfold under the title. The whole card is clickable (the title is the button, its ::after covers the card).
 * Wide screen (from 1440 px): the cards stand in a row and the open one is wider (width in flex-grow: the width of the text area, 420 : 182, so that with the 40 px paddings the cards are 500 and 262 px as in the design).
 * From 1440 to 1599 px the closed cards are narrower than 262 px, so the title is one size smaller there (derived).
 * Below: the cards stand one under another, and the text unfolds downwards (derived: the design has only the wide layout).
 */
export function StepCard({ step, isActive, progress, staticProgress, onOpen }: StepCardProps) {
  const { id, number, title, description } = step
  const width = useTransform(progress, (value) => `${value * 100}%`)

  return (
    <li
      data-el={`next-steps__card-${id}`}
      data-active={isActive}
      className={`relative flex flex-row items-start gap-4 overflow-clip rounded-40 p-6 ring-1 ring-border-subtle transition-[background-color,flex-grow] duration-700 ease-out ring-inset tablet:gap-8 tablet:p-8 min-[90rem]:h-170 min-[90rem]:min-w-0 min-[90rem]:flex-col min-[90rem]:justify-between min-[90rem]:gap-0 min-[90rem]:basis-0 min-[90rem]:p-10 ${
        isActive ? 'bg-surface-subtle min-[90rem]:grow-420' : 'bg-surface-subtle hover:bg-surface-hover min-[90rem]:grow-182'
      }`}
    >
      <p
        data-el={`next-steps__card-${id}-number`}
        className={`type-heading-xl w-14 shrink-0 transition-colors duration-700 tablet:type-display-sm tablet:w-20 min-[90rem]:type-display-lg min-[90rem]:w-full ${
          isActive ? 'text-typography-primary' : 'text-typography-tertiary'
        }`}
      >
        {number}
      </p>

      <div data-el={`next-steps__card-${id}-details`} className="flex min-w-0 flex-1 flex-col min-[90rem]:w-full min-[90rem]:flex-none">
        <h3 className="type-heading-md text-typography-primary tablet:type-heading-lg min-[90rem]:type-heading-lg min-[100rem]:type-heading-xl">
          <button
            type="button"
            data-el={`next-steps__card-${id}-title`}
            aria-expanded={isActive}
            onClick={onOpen}
            // Text-like button that stretches over the whole card.
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-typography-brand focus-visible:after:ring-inset focus-visible:after:rounded-40"
          >
            {title}
          </button>
        </h3>

        {/* Folds to nothing while closed (grid row 0fr to 1fr), but stays in the page for screen readers and search. */}
        <div
          aria-hidden={!isActive}
          inert={!isActive}
          className={`grid transition-[grid-template-rows] duration-700 ease-out ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="min-h-0 overflow-hidden">
            {/*
              In the row layout the text has the FINAL width of the open card from the start (open-width in `cqw` of the
              row of cards), so it never re-wraps while the card grows: the growing card just uncovers it, like a fill.
              It fades in a little later, when the card is already almost wide, and fades out fast on closing.
            */}
            <div
              className={`flex flex-col gap-6 pt-2 transition-opacity ease-out min-[90rem]:w-[calc((100cqw-392px)*0.4348)] min-[90rem]:gap-8 ${
                isActive ? 'opacity-100 delay-300 duration-500' : 'opacity-0 duration-200'
              }`}
            >
              <p
                data-el={`next-steps__card-${id}-desc`}
                className="type-body-md text-typography-secondary min-[90rem]:type-body-lead"
              >
                {description}
              </p>
              <div
                data-el={`next-steps__card-${id}-progress`}
                aria-hidden="true"
                className="h-1 overflow-clip rounded-pill bg-surface-black-16"
              >
                <motion.div
                  data-el={`next-steps__card-${id}-progress-bar`}
                  className="h-full rounded-pill bg-surface-brand-default"
                  // A card that has just been left keeps its full line while it folds; the open one follows the timer.
                  style={{ width: !isActive ? '100%' : staticProgress !== null ? `${staticProgress * 100}%` : width }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
