import { join } from 'node:path'

export const isProd = process.env.NODE_ENV === 'production'

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
