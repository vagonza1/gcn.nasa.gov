/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation,
  useTransition,
} from '@remix-run/react'
import type { ReactNode } from 'react'
import type {
  LoaderFunction,
  MetaFunction,
  LinksFunction,
} from '@remix-run/node'
import { GovBanner, GridContainer } from '@trussworks/react-uswds'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { getLogoutURL, storage } from '~/lib/auth.server'
import highlightStyle from 'highlight.js/styles/github.css'
import TopBarProgress from 'react-topbar-progress-indicator'
import { DevBanner } from './components/DevBanner'

TopBarProgress.config({
  barColors: {
    '0': '#e52207',
    '0.5': '#ffffff',
    '1.0': '#0050d8',
  },
})

export const meta: MetaFunction = () => {
  return { title: 'GCN - General Coordinates Network' }
}

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: '/_static/theme/css/custom.css',
  },
  {
    rel: 'stylesheet',
    href: highlightStyle,
  },
  ...[16, 40, 57, 72, 114, 144, 192].map((size) => ({
    rel: 'icon',
    href: `/_static/theme/img/favicons/favicon-${size}.png`,
    sizes: `${size}x${size}`,
  })),
]

interface LoaderData {
  email?: string
  logoutURL?: string
  hostname: string
}

export const loader: LoaderFunction = async function ({ request }) {
  const url = new URL(request.url)
  const result = { hostname: url.hostname }
  const session = await storage.getSession(request.headers.get('Cookie'))
  if (session.get('subiss')) {
    return {
      email: session.get('email'),
      logoutURL: await getLogoutURL(request),
      ...result,
    }
  } else {
    return result
  }
}

export function CatchBoundary() {
  const caught = useCatch()
  return (
    <Document>
      <h1>
        Error {caught.status}: {caught.statusText}
      </h1>
    </Document>
  )
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

function Document({ children }: { children: ReactNode }) {
  const location = useLocation()
  const loaderData = useLoaderData<LoaderData>()
  const transition = useTransition()

  return (
    <html lang="en-US">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <a className="usa-skipnav" href="#main-content">
          Skip to main content
        </a>
        {transition.state !== 'idle' && <TopBarProgress />}
        <GovBanner />
        <DevBanner hostname={loaderData.hostname} />
        <Header pathname={location.pathname} {...loaderData} />
        <section className="usa-section main-content">
          <GridContainer>{children}</GridContainer>
        </section>
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
