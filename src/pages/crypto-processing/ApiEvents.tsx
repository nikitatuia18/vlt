import { useState } from 'react'
import { Reveal, RevealLines } from '../../motion/reveal'
import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { apiContent } from './content'

/**
 * Block 2 of the Crypto Processing page: the code and the events. `crypto-processing__api`.
 * First version, static: on the left the heading and the list of webhook events, on the right a window with two tabs
 * (the request and the event). The window is code, like the one of Global: its text is not revealed by words.
 * The live version (typing code synchronised with the feed) comes after the designer has chosen it.
 */
export function ApiEvents() {
  const [tabId, setTabId] = useState<string>(apiContent.tabs[0].id)
  const tab = apiContent.tabs.find((item) => item.id === tabId) ?? apiContent.tabs[0]

  return (
    <section data-el="crypto-processing__api" aria-labelledby="crypto-processing-api-title" className="border-b border-border-subtle">
      <Container>
        <div className="relative flex flex-col gap-10 py-12 column-lines tablet:px-8 tablet:py-20 desktop:flex-row desktop:items-center desktop:gap-12 desktop:px-10 desktop:py-35">
          <div className="flex flex-col gap-8 desktop:w-1/2 desktop:gap-10">
            <div className="flex flex-col gap-4 tablet:gap-6">
              <RevealLines
                id="crypto-processing-api-title"
                data-el="crypto-processing__api-title"
                className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
                lines={[apiContent.title]}
              />
              <RevealLines
                as="p"
                delay={0.3}
                data-el="crypto-processing__api-text"
                className="type-body-md max-w-125 text-typography-secondary tablet:type-body-lead"
                lines={[apiContent.text]}
              />
            </div>

            <div data-el="crypto-processing__api-feed" className="flex flex-col">
              <RevealLines
                as="p"
                data-el="crypto-processing__api-feed-title"
                className="type-ui-md pb-3 text-typography-secondary"
                lines={[apiContent.feedTitle]}
              />
              <ul className="flex flex-col">
                {apiContent.events.map((event, index) => (
                  <li key={event.id} data-el={`crypto-processing__api-feed-${event.id}`} className="flex flex-col gap-1 border-t border-border-subtle py-4 last:border-b">
                    <RevealLines
                      as="span"
                      delay={0.1 + index * 0.1}
                      data-el={`crypto-processing__api-feed-event-${event.id}`}
                      className="type-code-sm text-typography-brand"
                      lines={[event.name]}
                    />
                    <RevealLines
                      as="span"
                      delay={0.2 + index * 0.1}
                      data-el={`crypto-processing__api-feed-note-${event.id}`}
                      className="type-body-md text-typography-primary"
                      lines={[event.note]}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Reveal variant="card" delay={0.2} className="w-full desktop:w-1/2">
            <div
              data-el="crypto-processing__api-code"
              className="overflow-hidden rounded-32 bg-surface-subtle ring-1 ring-border-subtle ring-inset desktop:rounded-48"
            >
              <div role="tablist" className="type-code-sm flex h-12 items-stretch border-b border-border-subtle px-4 whitespace-nowrap tablet:px-6">
                {apiContent.tabs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={item.id === tab.id}
                    data-el={`crypto-processing__api-tab-${item.id}`}
                    onClick={() => setTabId(item.id)}
                    className={`mr-6 border-b-2 px-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand ${
                      item.id === tab.id ? 'border-typography-brand text-typography-primary' : 'border-transparent text-typography-secondary hover:text-typography-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <pre role="tabpanel" className="type-code-sm min-h-64 overflow-x-auto px-4 py-5 whitespace-pre text-typography-primary tablet:px-6">
                {tab.code}
              </pre>
            </div>
          </Reveal>

          <CornerDots edge="bottom" block="crypto-processing-api" />
        </div>
      </Container>
    </section>
  )
}
