import { Reveal, RevealLines } from '../../motion/reveal'
import { Badge } from '../../components/ui/Badge'
import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { flowContent } from './content'

/**
 * Block 1 of the Crypto Processing page: the path of a payment, accept → convert → settle. `crypto-processing__flow`.
 * First version, static: three nodes on a dotted line (client wallet, Velant, your account), the chips of what is chosen on the way
 * and a short text under each step. The living scene of dots comes after the designer has chosen it (docs/pages/crypto-processing.md).
 */
export function PaymentFlow() {
  return (
    <section id="how-it-works" data-el="crypto-processing__flow" aria-labelledby="crypto-processing-flow-title" className="border-y border-border-subtle">
      <Container>
        <div className="relative flex flex-col items-center gap-8 py-12 column-lines tablet:gap-10 tablet:px-8 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-35">
          <div className="flex flex-col items-center gap-4 text-center tablet:gap-6">
            <RevealLines
              id="crypto-processing-flow-title"
              data-el="crypto-processing__flow-title"
              className="type-heading-lg max-w-156 text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              lines={[flowContent.title]}
            />
            <RevealLines
              as="p"
              delay={0.3}
              data-el="crypto-processing__flow-intro"
              className="type-body-md max-w-150 text-typography-secondary tablet:type-body-lead"
              lines={[flowContent.intro]}
            />
          </div>

          <Reveal
            variant="card"
            data-el="crypto-processing__flow-scene"
            className="relative w-full rounded-32 bg-surface-subtle p-6 ring-1 ring-border-subtle ring-inset tablet:p-10 desktop:rounded-48 desktop:p-15"
          >
            {/* The dotted line the payment runs along: behind the nodes, from the first to the last (columns, wide screens). */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[16.6%] top-[calc(var(--spacing)*10+24px)] hidden border-t border-dashed border-border-strong tablet:block desktop:top-[calc(var(--spacing)*15+24px)]"
            />
            <ol className="relative grid grid-cols-1 gap-10 tablet:grid-cols-3 tablet:gap-8">
              {flowContent.steps.map((step, index) => (
                <li key={step.id} data-el={`crypto-processing__flow-step-${step.id}`} className="flex flex-col items-center gap-5 text-center">
                  <Reveal
                    variant="pop"
                    delay={0.2 + index * 0.15}
                    data-el={`crypto-processing__flow-node-${step.id}`}
                    className="flex h-12 items-center rounded-pill bg-surface-page px-6 ring-1 ring-border-medium ring-inset"
                  >
                    <RevealLines as="span" delay={0.35 + index * 0.15} className="type-ui-lg whitespace-nowrap text-typography-primary" lines={[step.node]} />
                  </Reveal>
                  <div className="flex min-h-10 flex-wrap justify-center gap-2">
                    {step.chips.map((chip) => (
                      <Badge key={chip} data-el={`crypto-processing__flow-chip-${chip.toLowerCase()}`} labelReveal={{ delay: 0.5 + index * 0.15 }}>
                        {chip}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <RevealLines
                      as="h3"
                      delay={0.3 + index * 0.1}
                      data-el={`crypto-processing__flow-step-${step.id}-title`}
                      className="type-heading-md text-typography-primary"
                      lines={[step.title]}
                    />
                    <RevealLines
                      as="p"
                      delay={0.4 + index * 0.1}
                      data-el={`crypto-processing__flow-step-${step.id}-text`}
                      className="type-body-md mx-auto max-w-75 text-typography-secondary"
                      lines={[step.text]}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <CornerDots edge="top" block="crypto-processing-flow" />
          <CornerDots edge="bottom" block="crypto-processing-flow" />
        </div>
      </Container>
    </section>
  )
}
