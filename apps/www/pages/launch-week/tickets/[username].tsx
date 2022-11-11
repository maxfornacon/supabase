import { NextSeo } from 'next-seo'
import { GetStaticProps, GetStaticPaths } from 'next'
import Error from 'next/error'
import DefaultLayout from '~/components/Layouts/Default'
import SectionContainer from '~/components/Layouts/SectionContainer'
import TicketContainer from '~/components/LaunchWeek/Ticket/TicketContainer'
import { SITE_URL, SAMPLE_TICKET_NUMBER } from '~/lib/constants'
import { getUserByUsername } from '~/lib/launch-week-ticket/db-api'

type Props = {
  username: string | null
  name: string | null
  ticketNumber: number | null
  golden: boolean
}

export default function TicketShare({ username, ticketNumber, name, golden }: Props) {
  const description = 'Supabase Launch Week 6 | 12-16 Dec 2022'

  if (!ticketNumber) {
    return <Error statusCode={404} />
  }

  return (
    <>
      <NextSeo
        title={`${name ? name + '’s' : 'Get your'} #SupaLaunchWeek Ticket`}
        openGraph={{
          title: `${name ? name + '’s' : 'Get your'} #SupaLaunchWeek Ticket`,
          description: description,
          url: `${SITE_URL}/tickets/${username}`,
          images: [
            {
              url: `https://supabase.com/images/launchweek/og-image.jpg`, // TODO
            },
          ],
        }}
      />
      <div className="launch-week-gradientBg"></div>
      <DefaultLayout>
        <SectionContainer className="flex flex-col gap-8 !pb-0 md:gap-16 lg:gap-16">
          <img
            src="/images/launchweek/launchweek-logo--light.svg"
            className="md:40 w-28 dark:hidden lg:w-48"
          />
          <img
            src="/images/launchweek/launchweek-logo--dark.svg"
            className="md:40 hidden w-28 dark:block lg:w-48"
          />
          <TicketContainer
            defaultUserData={{
              username: username || undefined,
              name: name || '',
              ticketNumber,
              golden,
            }}
            sharePage
          />
        </SectionContainer>
      </DefaultLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const username = params?.username?.toString() || null
  let name: string | null | undefined
  let ticketNumber: number | null | undefined
  const GOLDEN_TICKETS = (process.env.GOLDEN_TICKETS?.split(',') ?? []).map((n) => Number(n))

  if (username && username !== 'register') {
    const user = await getUserByUsername(username)
    name = user.name ?? user.username
    ticketNumber = user.ticketNumber
  }
  return {
    props: {
      username: ticketNumber ? username : null,
      usernameFromParams: username || null,
      name: ticketNumber ? name || username || null : null,
      ticketNumber: ticketNumber || SAMPLE_TICKET_NUMBER,
      golden: GOLDEN_TICKETS.includes(ticketNumber ?? SAMPLE_TICKET_NUMBER),
    },
    revalidate: 5,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return Promise.resolve({
    paths: [],
    fallback: 'blocking',
  })
}
