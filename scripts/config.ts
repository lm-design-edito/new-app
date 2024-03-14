import { join } from 'node:path'

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * ENV
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export const isProd = process.env.NODE_ENV === 'production'

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * DEPLOYMENT
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export enum Bucket {
  V1_ALPHA = 'gs://decodeurs/design-edito/v1.alpha',
  V1_BETA = 'gs://decodeurs/design-edito/v1.beta',
  TEST = 'gs://decodeurs/design-edito/240314-delete-me-im-a-test'
}

export type BucketMetaData = {
  publicUrl: string
  versionRange: string
}

export const bucketsMetadataMap = new Map<Bucket, BucketMetaData>([
  [Bucket.V1_ALPHA, {
    publicUrl: 'https://assets-decodeurs.lemonde.fr/design-edito/v1.alpha',
    versionRange: '>=1.0.0-alpha <=1.0.0-alpha.999999999'
  }],
  [Bucket.V1_BETA, {
    publicUrl: 'https://assets-decodeurs.lemonde.fr/design-edito/v1.beta',
    versionRange: '>=1.0.0-beta <=1.0.0-beta.999999999'
  }],
  [Bucket.TEST, {
    publicUrl: 'https://assets-decodeurs.lemonde.fr/design-edito/240314-delete-me-im-a-test',
    versionRange: '>=0.0.0-a'
  }]
])

// [WIP] Check and throw if bucketsMetadataMap does not contain all bucket names ?

export const allowedNpmRegistries: [string, string] = [
  new URL('https://registry.npmjs.org/').toString(),
  new URL('http://localhost:4873').toString()
]

export const preferredNpmRegistry = allowedNpmRegistries[0]

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * PATHS
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Root
export const CWD = process.cwd()

// Package.json
export const PACKAGEJSON        = join(CWD,        'package.json')

// Modules
export const MODULES            = join(CWD,        'node_modules')

// Scripts
export const SCRIPTS            = join(CWD,        'scripts')
export const SCRIPTS_CONFIG     = join(SCRIPTS,    'config.js')

// Src
export const SRC                = join(CWD,        'src')
export const SRC_TSCONFIG       = join(SRC,        'tsconfig.json')
export const SRC_TSCONFIG_DIST  = join(SRC,        'tsconfig.dist.json')
export const SRC_TSCONFIG_LIB   = join(SRC,        'tsconfig.lib.json')
export const SRC_APPS           = join(SRC,        'apps')
export const SRC_COMPONENTS     = join(SRC,        'components')
export const SRC_UTILS          = join(SRC,        'utils')
export const SRC_SHARED         = join(SRC,        'shared')
export const SRC_SCRIPT         = join(SRC_SHARED, 'index.tsx')
export const SRC_FONTS          = join(SRC_SHARED, 'fonts')
export const SRC_ASSETS         = join(SRC_SHARED, 'assets')
export const SRC_STYLES         = join(SRC_SHARED, 'styles')

// Dist
export const DST_DEV            = join(CWD,        '.dist/dev')
export const DST_PROD           = join(CWD,        '.dist/prod')
export const DST                = isProd ? DST_PROD : DST_DEV
export const DST_SHARED         = join(DST,        'shared')
export const DST_FONTS          = join(DST_SHARED, 'fonts')
export const DST_ASSETS         = join(DST_SHARED, 'assets')
export const DST_STYLES         = join(DST_SHARED, 'styles')

// Lib
export const LIB                = join(CWD,        '.lib')

// Published
export const PUBLISHED          = join(CWD,        'published')

// Temp
export const TEMP               = join(CWD,        '.temp')

// Versions
export const VERSIONS           = join(CWD,        '.versions')
