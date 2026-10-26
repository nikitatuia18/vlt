import { motion, useInView, useScroll, useReducedMotion } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { Reveal, RevealLines } from '../../motion/reveal'
import { stepsContent } from './content'
import { StepCreate } from './StepCreate'
import { StepPay } from './StepPay'
import { StepSend } from './StepSend'

const scenes: Record<(typeof stepsContent.steps)[number]['id'], ReactNode> = {
  create: <StepCreate />,
  send: <StepSend />,
  'get-paid': <StepPay />,
}

/**
 * The block of three steps of the Invoicing page: "Create. Send. Get paid." `invoicing__steps`.
 * One invoice goes through three screens, each a micro interface the visitor touches (the choice of the first one is used by the others).
 * A dotted rail runs down the left of the steps and its coloured part grows with the scroll; the number of a step lights up when the step is reached
 * (from the desktop width; below it the number stands in the card).
 */
export function InvoiceSteps() {
  const listRef = useRef<HTMLOListElement>(null)
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 70%', 'end 70%'] })

  return (
    <section id="how-it-works" data-el="invoicing__steps" aria-labelledby="invoicing-steps-title" className="border-y border-border-subtle">
      <Container>
        <div className="relative flex flex-col items-center gap-8 py-12 column-lines tablet:gap-10 tablet:px-8 tablet:py-20 desktop:gap-16 desktop:px-10 desktop:py-35">
          <div className="flex flex-col items-center gap-4 text-center tablet:gap-6">
            <RevealLines
              id="invoicing-steps-title"
              data-el="invoicing__steps-title"
              className="type-heading-lg max-w-156 text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              lines={[stepsContent.title]}
            />
            <RevealLines
              as="p"
              delay={0.3}
              data-el="invoicing__steps-intro"
              className="type-body-md max-w-150 text-typography-secondary tablet:type-body-lead"
              lines={[stepsContent.intro]}
            />
          </div>

          <ol ref={listRef} className="relative flex w-full flex-col gap-6 tablet:gap-8 desktop:pl-20">
            {/* The rail: dashed, with the part already travelled in the brand color. */}
            <span aria-hidden="true" className="absolute top-6 bottom-6 left-6 hidden w-0 border-l-2 border-dashed border-typography-tertiary desktop:block">
              <motion.span
                className="absolute -left-0.5 block h-full origin-top border-l-2 border-dashed border-typography-brand"
                style={{ scaleY: reduced ? 1 : scrollYProgress }}
              />
            </span>
            {stepsContent.steps.map((step, index) => (
              <Step key={step.id} id={step.id} index={index} label={step.label} title={step.title} text={step.text}>
                {scenes[step.id]}
              </Step>
            ))}
          </ol>

          <CornerDots edge="top" block="invoicing-steps" />
          <CornerDots edge="bottom" block="invoicing-steps" />
        </div>
      </Container>
    </section>
  )
}

function Step({ id, index, label, title, text, children }: { id: string; index: number; label: string; title: string; text: string; children: ReactNode }) {
  const ref = useRef<HTMLLIElement>(null)
  // The step counts as reached when its top is in the upper two thirds of the screen; it stays reached.
  const reached = useInView(ref, { margin: '0px 0px -35% 0px', once: true })
  const number = String(index + 1).padStart(2, '0')
  return (
    <li ref={ref} data-el={`invoicing__step-${id}`} className="relative">
      <span
        aria-hidden="true"
        data-el={`invoicing__step-${id}-number`}
        data-reached={reached}
        className={`type-ui-lg absolute top-0 -left-20 z-10 hidden size-12 items-center justify-center rounded-pill ring-4 ring-surface-subtle transition-colors duration-500 desktop:flex ${
          reached ? 'bg-surface-inverse text-typography-inverse' : 'bg-surface-hover text-typography-secondary'
        }`}
      >
        {index + 1}
      </span>
      <Reveal
        variant="card"
        className="grid grid-cols-1 gap-6 rounded-32 bg-surface-subtle p-4 ring-1 ring-border-subtle ring-inset tablet:p-8 desktop:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] desktop:gap-10 desktop:rounded-48 desktop:p-10"
      >
        <div className="flex flex-col gap-4 desktop:pt-1">
          <p className="type-ui-caps text-typography-secondary">
            <span data-el={`invoicing__step-${id}-label-number`} className="desktop:hidden">
              {number} —{' '}
            </span>
            <RevealLines as="span" lines={[label]} />
          </p>
          <RevealLines as="h3" data-el={`invoicing__step-${id}-title`} className="type-heading-lg text-typography-primary tablet:type-heading-xl" lines={[title]} />
          <RevealLines as="p" delay={0.2} data-el={`invoicing__step-${id}-text`} className="type-body-md text-typography-secondary" lines={[text]} />
        </div>
        <div className="min-w-0 rounded-32 bg-surface-page p-4 ring-1 ring-border-subtle ring-inset tablet:p-6">{children}</div>
      </Reveal>
    </li>
  )
}
