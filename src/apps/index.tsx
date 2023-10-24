import { VNode } from 'preact'
import Logger from '~/utils/silent-log'

export namespace Apps {
  export enum Name {
    NAME = 'name',
    SCRLLGNGN = 'scrllgngn'
  }

  export function isValidName (input: string): input is Name {
    return Object.values(Name).includes(input as any)
  }

  type Renderer = (unknownProps: unknown) => VNode

  export async function load (name: Name): Promise<Renderer> {
    if (name === Name.SCRLLGNGN) return (await import('./scrllgngn')).default
    return () => <></>
  }

  export async function render (
    name: Name,
    unknownProps: unknown,
    logger?: Logger): Promise<VNode> {
    const loader = await load(name)
    return loader(unknownProps)
  }
}
