'use server'

import config from '@payload-config'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'

import { importMap } from './admin/importMap.js'

export const serverFunction: ServerFunctionClient = async (args) => {
  return handleServerFunctions({
    name: args.name,
    args: args.args,
    config,
    importMap,
  })
}
