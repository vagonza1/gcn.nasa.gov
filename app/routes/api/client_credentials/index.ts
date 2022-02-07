import { ActionFunction, LoaderFunction } from 'remix'

import { ClientCredentialVendingMachine } from '~/lib/ClientCredentialVendingMachine.server'

export const loader: LoaderFunction = async ({ request }) => {
  const machine = await ClientCredentialVendingMachine.create(request)
  return await machine.getClientCredentials()
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method != 'POST') throw new Response(null, { status: 405 })

  const [machine, body] = await Promise.all([
    ClientCredentialVendingMachine.create(request),
    request.json(),
  ])
  return await machine.createClientCredential(body.name, body.scope)
}

// FIXME: workaround for https://github.com/remix-run/remix/issues/1828.
// Resource routes (without browser code) don't get server pruning done.
// Once fixed upstream, remove.
export const meta = () => ({})
