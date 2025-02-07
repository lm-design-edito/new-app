import { Component } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'
import { unknownToString } from '@design-edito/tools/agnostic/errors/unknown-to-string'
import { isNonNullObject } from '@design-edito/tools/agnostic/objects/is-object'
import Thumbnail from './Thumbnail'

export type ForecastApiArticleData = {
  url?: string
  title?: string
  description?: string
  img?: string
  free?: string
  author?: string
  section?: string
  subSection?: string
  keywords?: string
  publishedAt?: string
  modifiedAt?: string
}

export const orderByOptions = ['pageview', 'uniquePageview', 'readingRate', 'readingTime', 'totalShare', 'shareRate', 'shareFb', 'shareTw', 'shareMail', 'comment', 'commentRate', 'gift', 'tunnelAccess', 'abortion', 'conversion', 'conversionRate', 'unsubwill', 'churn'] as const
export const langOptions = ['fr', 'en'] as const
export const deviceOptions = ['all', 'desktop', 'mobile', 'tablet', 'mobile_ios', 'mobile_android'] as const
export const mediumOptions = ['all', 'search', 'social', 'direct', 'internal'] as const
export const sinceOptions = ['1h', '1d', '2d', '7d', '30d'] as const
export const publishedSinceOptions = ['1d', '2d', '3d', '4d', '5d', '6d', '7d', '30d'] as const
export const orderByDirectionOptions = ['desc', 'asc'] as const

export type Props = {
  dateFormat?: string
  dateLocale?: string
  orderBy?: typeof orderByOptions[number]
  lang?: typeof langOptions[number]
  device?: typeof deviceOptions[number]
  medium?: typeof mediumOptions[number]
  since?: typeof sinceOptions[number]
  publishedSince?: typeof publishedSinceOptions[number]
  free?: boolean
  author?: string
  subsection?: string
  section?: string
  keywords?: string
  excludedSections?: string
  excludedSubsections?: string
  itemNumber?: number
  page?: number
  orderByDirection?: typeof orderByDirectionOptions[number]
}

export type State = {
  loading: boolean
  error: null | string
  articlesData: ForecastApiArticleData[]
}

export default class TopArticles extends Component<Props, State> {
  static clss: string = 'lm-top-articles'
  clss = TopArticles.clss
  bemClss = Bem.bem('lm-top-articles')

  state: State = {
    loading: false,
    error: null,
    articlesData: []
  }

  constructor (props: Props) {
    super(props)
    this.fetchArticles = this.fetchArticles.bind(this)
  }

  componentDidMount(): void {
    this.fetchArticles()
  }

  async fetchArticles () {
    const { props } = this
    this.setState({ loading: true, error: null })
    // this.setState({
    //   articlesData: [{"title":"Donald Trump provoque la sid\u00e9ration en envisageant un contr\u00f4le am\u00e9ricain de la bande de Gaza","description":"A l\u2019issue d\u2019une rencontre avec le premier ministre isra\u00e9lien, Benyamin N\u00e9tanyahou, le pr\u00e9sident am\u00e9ricain a r\u00e9p\u00e9t\u00e9 qu\u2019il souhaitait vider le territoire palestinien de ses habitants, avant d\u2019\u00e9voquer une \u00ab\u00a0situation de propri\u00e9t\u00e9 sur le long terme\u00a0\u00bb des Etats-Unis.","img":"https:\/\/img.lemde.fr\/2025\/02\/04\/1328\/0\/4004\/2669\/600\/0\/60\/0\/13786a2_ftp-import-images-1-zbcq35hsiaxr-d87b1a05dbca45919718efd21908c97c-0-06e94954c73f4a7fb14fb0f66a4867f4.jpg","free":"0","author":"Piotr Smolar","section":"International","subSection":"Guerre Isra\u00ebl-Hamas","keywords":"International,Guerre Isra\u00ebl-Hamas,Guerres au Proche-Orient,Proche-Orient,Diplomatie,\u00c9tats-Unis,Am\u00e9riques,Donald Trump","publishedAt":"2025-02-05 04:28:26","modifiedAt":"2025-02-05 10:34:46","url":"https:\/\/www.lemonde.fr\/international\/article\/2025\/02\/05\/donald-trump-provoque-la-sideration-generale-en-envisageant-un-controle-americain-de-la-bande-de-gaza_6532218_3210.html","pageview":"714692","uniquePageview":"648524","readingRate":"61.8845","readingTime":"64.88548366541325","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"736","commentRate":"0.0011348847588423065","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"32","conversionRate":"0.00004934281533481963","unsubwill":"0","churn":"0"},{"title":"Su\u00e8de\u00a0: dix\u00a0morts dans une \u00ab\u00a0tuerie de masse\u00a0\u00bb dans un centre de formation, \u00ab\u00a0la pire\u00a0\u00bb de l\u2019histoire du pays","description":"Un homme a tu\u00e9 dix personnes par balles dans un \u00e9tablissement de la ville d\u2019\u00d6rebro. Il a \u00e9galement trouv\u00e9 la mort. \u00ab\u00a0Le motif de la fusillade n\u2019est pas encore connu, mais tout porte \u00e0 croire que l\u2019auteur a agi seul, sans motif id\u00e9ologique\u00a0\u00bb, selon la police.","img":"https:\/\/img.lemde.fr\/2025\/02\/04\/203\/0\/8160\/5440\/600\/0\/60\/0\/66e90d9_ftp-import-images-1-6lzvctxev3ff-2025-02-04t172636z-1172256798-rc2tncaefxq2-rtrmadp-3-sweden-crime.JPG","free":"1","author":null,"section":"International","subSection":"Su\u00e8de","keywords":"Su\u00e8de,Europe,International","publishedAt":"2025-02-05 06:33:18","modifiedAt":"2025-02-05 11:27:32","url":"https:\/\/www.lemonde.fr\/international\/article\/2025\/02\/05\/la-suede-sous-le-choc-apres-une-tuerie-de-masse-dans-un-centre-de-formation-la-pire-de-son-histoire_6531321_3211.html","pageview":"518377","uniquePageview":"489226","readingRate":"56.3389","readingTime":"23.93093592462483","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"81","commentRate":"0.0001655676573027678","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"0","conversionRate":"0","unsubwill":"0","churn":"0"},{"title":"En direct, cessez-le-feu \u00e0 Gaza\u00a0: apr\u00e8s les d\u00e9clarations de Donald Trump, le roi de Jordanie rejette \u00ab\u00a0toute tentative d\u2019annexion des terres et de d\u00e9placement des Palestiniens\u00a0\u00bb","description":"La Jordanie fait partie, avec l\u2019Egypte, des pays \u00ab\u00a0plus s\u00fbrs\u00a0\u00bb cit\u00e9s par Donald Trump qui pourraient, selon lui, accueillir des Palestiniens transf\u00e9r\u00e9s de Gaza.","img":"https:\/\/img.lemde.fr\/2025\/02\/05\/0\/0\/4771\/3181\/600\/0\/60\/0\/5a72e84_sirius-fs-upload-1-exesu6ituaz7-1738769323353-883580.jpg","free":"1","author":"Jean-Philippe Lefief","section":"International","subSection":"Guerres au Proche-Orient","keywords":"Guerres au Proche-Orient,Proche-Orient,International,Guerre Isra\u00ebl-Hamas,En Direct","publishedAt":"2025-02-05 13:23:08","modifiedAt":"2025-02-05 16:46:57","url":"https:\/\/www.lemonde.fr\/international\/live\/2025\/02\/05\/en-direct-cessez-le-feu-a-gaza-la-france-dit-son-opposition-a-tout-deplacement-force-de-la-population-palestinienne-apres-les-declarations-de-donald-trump_6524626_3210.html","pageview":"476912","uniquePageview":"448719","readingRate":"0.0000","readingTime":"0","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"0","commentRate":"0","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"0","conversionRate":"0","unsubwill":"0","churn":"0"},{"title":"\u00ab\u00a0Contraints \u00e0 l\u2019\u00e9tranger, les oligarques russes rapatrient leur argent et l\u2019investissent dans l\u2019immobilier de luxe\u00a0\u00e0 Moscou\u00a0\u00bb","description":"Le prix des logements haut de gamme dans la capitale russe a augment\u00e9 de plus de 20\u00a0% en\u00a02024\u00a0et approche d\u00e9sormais les 20\u00a0000\u00a0euros le m\u00e8tre carr\u00e9, constate Philippe Escande, \u00e9ditorialiste \u00e9conomique au \u00ab\u00a0Monde\u00a0\u00bb.","img":"https:\/\/img.lemde.fr\/2025\/02\/04\/0\/276\/2947\/1965\/600\/0\/60\/0\/05703b2_sirius-fs-upload-1-ixqfgccyw10o-1738659854607-pns-773008770-1.jpg","free":"0","author":"Philippe Escande","section":"\u00c9conomie","subSection":"Pertes et profits","keywords":"Pertes et profits,\u00c9conomie,Immobilier,Argent & Placements,Russie,Guerre en Ukraine","publishedAt":"2025-02-04 10:00:07","modifiedAt":"2025-02-04 10:00:07","url":"https:\/\/www.lemonde.fr\/economie\/article\/2025\/02\/04\/contraints-a-l-etranger-les-oligarques-russes-rapatrient-leur-argent-et-l-investissent-dans-l-immobilier-de-luxe-a-moscou_6530914_3234.html","pageview":"292010","uniquePageview":"280194","readingRate":"51.6232","readingTime":"24.24876879039583","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"28","commentRate":"0.0000999307631865945","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"0","conversionRate":"0","unsubwill":"0","churn":"0"},{"title":"En direct, guerre en Ukraine\u00a0: la Russie et l\u2019Ukraine ont \u00e9chang\u00e9 150\u00a0prisonniers de guerre de chaque camp","description":"Le pr\u00e9sident ukrainien, Volodymyr Zelensky, et le minist\u00e8re de la d\u00e9fense russe ont chacun confirm\u00e9 le retour de 150\u00a0soldats dans chaque pays.","img":"https:\/\/img.lemde.fr\/2024\/04\/24\/0\/0\/6000\/4000\/600\/0\/60\/0\/dd70c44_1713995806357-296613.jpg","free":"1","author":"Sol\u00e8ne L'H\u00e9noret, Louise Vall\u00e9e","section":"International","subSection":"Guerre en Ukraine","keywords":"Guerre en Ukraine,Ukraine,Europe,International,En Direct","publishedAt":"2025-02-05 15:39:35","modifiedAt":"2025-02-05 15:39:35","url":"https:\/\/www.lemonde.fr\/international\/live\/2025\/02\/05\/en-direct-guerre-en-ukraine-la-russie-et-l-ukraine-ont-echange-150-prisonniers-de-guerre-de-chaque-camp_6530522_3210.html","pageview":"279088","uniquePageview":"263677","readingRate":"0.0000","readingTime":"0","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"0","commentRate":"0","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"0","conversionRate":"0","unsubwill":"0","churn":"0"},{"title":"En Su\u00e8de, apr\u00e8s \u00ab\u00a0la pire tuerie de masse de l\u2019histoire\u00a0\u00bb du pays, \u00ab\u00a0beaucoup de questions restent sans r\u00e9ponse\u00a0\u00bb","description":"Dix personnes ont \u00e9t\u00e9 tu\u00e9es et plusieurs gravement bless\u00e9es lors de l\u2019attaque contre un centre de formation pour adultes \u00e0 \u00d6rebro, mardi. Le suspect a \u00e9t\u00e9 retrouv\u00e9 mort.","img":"https:\/\/img.lemde.fr\/2025\/02\/04\/0\/0\/8217\/5478\/600\/0\/60\/0\/1ac25bd_ftp-import-images-1-hie3ldvxofg5-5942188-01-06.jpg","free":"0","author":"Anne-Fran\u00e7oise Hivert","section":"International","subSection":"Su\u00e8de","keywords":"Su\u00e8de,Europe,International","publishedAt":"2025-02-04 23:46:38","modifiedAt":"2025-02-05 09:30:49","url":"https:\/\/www.lemonde.fr\/international\/article\/2025\/02\/05\/en-suede-beaucoup-de-questions-restent-sans-reponse-apres-la-pire-tuerie-de-masse-de-l-histoire-du-pays_6532008_3210.html","pageview":"187940","uniquePageview":"176473","readingRate":"57.9716","readingTime":"39.1531463509626","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"37","commentRate":"0.00020966379453242175","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"3","conversionRate":"0.000016999768025820483","unsubwill":"0","churn":"0"},{"title":"En direct, budget\u00a02025\u00a0: la premi\u00e8re motion de censure contre le gouvernement Bayrou est rejet\u00e9e","description":"Seuls 128 d\u00e9put\u00e9s ont vot\u00e9 pour, loin de la majorit\u00e9 requise, fix\u00e9e \u00e0 289 voix, pour faire tomber le gouvernement. Comme pr\u00e9vu, le PS et le RN n\u2019ont pas soutenu la motion. Une deuxi\u00e8me motion de censure, \u00e9galement d\u00e9pos\u00e9e par LFI apr\u00e8s le 49.3\u00a0utilis\u00e9 pour le budget de la S\u00e9curit\u00e9 sociale, est examin\u00e9e dans la foul\u00e9e.","img":"https:\/\/img.lemde.fr\/2025\/02\/05\/0\/0\/6192\/4128\/600\/0\/60\/0\/ba23583_ftp-import-images-1-xwdsgnpl7yqj-5950245-01-06.jpg","free":"1","author":"Dorian Jullien, Louise Vall\u00e9e","section":"Politique","subSection":"Gouvernement Bayrou","keywords":"Politique,Finances publiques,Gouvernement Bayrou,Fran\u00e7ois Bayrou premier ministre,En Direct","publishedAt":"2025-02-05 16:05:22","modifiedAt":"2025-02-05 17:24:03","url":"https:\/\/www.lemonde.fr\/politique\/live\/2025\/02\/05\/en-direct-budget-2025-l-examen-de-la-premiere-motion-de-censure-contre-le-gouvernement-bayrou-dont-le-rejet-est-attendu-a-commence_6524931_823448.html","pageview":"180523","uniquePageview":"167604","readingRate":"0.0000","readingTime":"0","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"0","commentRate":"0","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"0","conversionRate":"0","unsubwill":"0","churn":"0"},{"title":"Affaire de la fraude aux eaux min\u00e9rales de Nestl\u00e9\u00a0: Emmanuel Macron affirme qu\u2019il n\u2019y a eu ni \u00ab\u00a0entente\u00a0\u00bb ni \u00ab\u00a0connivence\u00a0\u00bb","description":"Selon l\u2019enqu\u00eate du \u00ab\u00a0Monde\u00a0\u00bb et Radio France, de nombreux \u00e9changes de courriels et de notes minist\u00e9rielles montrent que l\u2019Elys\u00e9e et Matignon ont privil\u00e9gi\u00e9 les int\u00e9r\u00eats de la multinationale au d\u00e9triment de ceux des consommateurs.","img":"https:\/\/img.lemde.fr\/2025\/02\/04\/0\/0\/4732\/3154\/600\/0\/60\/0\/0acdff7_ftp-import-images-1-gtoms8evshfw-2025-02-04t130156z-1864365491-rc2nncanykul-rtrmadp-3-france-politics.JPG","free":"1","author":null,"section":"Plan\u00e8te","subSection":"Eau","keywords":"Eau,Plan\u00e8te","publishedAt":"2025-02-04 14:06:54","modifiedAt":"2025-02-04 14:57:52","url":"https:\/\/www.lemonde.fr\/planete\/article\/2025\/02\/04\/eaux-nestle-emmanuel-macron-affirme-qu-il-n-y-a-eu-ni-entente-ni-connivence-avec-qui-que-ce-soit_6531427_3244.html","pageview":"178154","uniquePageview":"164602","readingRate":"67.5296","readingTime":"18.131450583712564","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"170","commentRate":"0.0010327942399656507","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"0","conversionRate":"0","unsubwill":"0","churn":"0"},{"title":"Oscars 2025\u00a0: Netflix prend ses distances avec la\u00a0star d\u2019\u00ab\u00a0Emilia Perez\u00a0\u00bb, Karla Sofia Gascon","description":"A la suite de tweets pol\u00e9miques, l\u2019actrice espagnole transgenre n\u2019appara\u00eet plus dans les campagnes de communication du g\u00e9ant du streaming, et ne devrait plus participer \u00e0\u00a0divers \u00e9v\u00e9nements, comme le gala des Critics Choice Awards.","img":"https:\/\/img.lemde.fr\/2025\/02\/05\/1\/0\/4315\/2876\/600\/0\/60\/0\/9d9c90f_sirius-fs-upload-1-2d8q2tf9vwp6-1738729844698-000-36uh96h.jpg","free":"1","author":null,"section":"Cin\u00e9ma","subSection":"Oscars","keywords":"Cin\u00e9ma,Culture,Oscars","publishedAt":"2025-02-05 02:56:42","modifiedAt":"2025-02-05 09:29:56","url":"https:\/\/www.lemonde.fr\/cinema\/article\/2025\/02\/05\/netflix-prend-ses-distances-avec-la-star-d-emilia-perez_6532047_3476.html","pageview":"162937","uniquePageview":"153269","readingRate":"77.7723","readingTime":"25.128778100037845","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"99","commentRate":"0.0006459231809229539","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"0","conversionRate":"0","unsubwill":"0","churn":"0"},{"title":"Donald Trump signe un d\u00e9cret pour retirer les Etats-Unis du Conseil des droits de l\u2019homme de l\u2019ONU","description":"Le texte, qui vise \u00e0 interdire toute future implication de Washington dans l\u2019organisme, prolonge aussi la suspension de tout financement am\u00e9ricain \u00e0 l\u2019Agence des Nations unies pour les r\u00e9fugi\u00e9s palestiniens.","img":"https:\/\/img.lemde.fr\/2025\/02\/04\/0\/0\/5240\/3493\/600\/0\/60\/0\/9825a0c_sirius-fs-upload-1-x5y25nkb0wn4-1738701222549-ap25004042243617.jpg","free":"1","author":null,"section":"International","subSection":"Donald Trump","keywords":"Donald Trump,\u00c9tats-Unis,Am\u00e9riques,International,Droits humains","publishedAt":"2025-02-04 21:35:30","modifiedAt":"2025-02-04 21:35:30","url":"https:\/\/www.lemonde.fr\/international\/article\/2025\/02\/04\/donald-trump-signe-un-decret-pour-retirer-les-etats-unis-du-conseil-des-droits-de-l-homme-de-l-onu_6531942_3210.html","pageview":"156761","uniquePageview":"148157","readingRate":"58.4144","readingTime":"27.979097937918365","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"45","commentRate":"0.0003037318521365621","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"0","conversionRate":"0","unsubwill":"0","churn":"0"}]
    // })
    // return
    try {
      const requestUrlRoot = `https://forecast.lemonde.fr/api/v1/top-articles/${props.orderBy ?? 'pageview'}?`
      const requesUrlParams = {
        key: window.atob('QUl6YVN5REVKLW45NGNncXFTOGlwVlhOVmYwTzZRbnpieTUwaFRv'),
        orderByDirection: props.orderBy,
        lang: props.lang,
        device: props.device,
        medium: props.medium,
        since: props.since,
        publishedSince: props.publishedSince,
        free: props.free,
        author: props.author,
        subsection: props.subsection,
        section: props.section,
        keywords: props.keywords,
        excludedSections: props.excludedSections,
        excludedSubsections: props.excludedSubsections,
        itemNumber: props.itemNumber,
        page: props.page
      }
      const requestUrlQueryString = Object
        .entries(requesUrlParams)
        .filter(([_, val]) => val !== undefined)
        .map(([key, val]) => `${key}=${encodeURIComponent(`${val ?? ''}`)}`)
        .join('&')
      const requestUrl = `${requestUrlRoot}${requestUrlQueryString}`
      const response = await window.fetch(requestUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      if (!response.ok) throw `HTTP error status: ${response.status} - ${response.statusText}`
      const articlesData = await response.json()
      if (!Array.isArray(articlesData)) throw `Response is not an array. ${JSON.stringify(articlesData)}`
      if (articlesData.some(article => !isNonNullObject(article))) throw `Some items in response array are not objects. ${JSON.stringify(articlesData)}`
      this.setState({ loading: false, error: null, articlesData: articlesData as ForecastApiArticleData[] })
    } catch (err) {
      console.error(err)
      const errStr = unknownToString(err)
      this.setState({ loading: false, error: errStr })
    }
  }

  render() {
    const { state, bemClss } = this
    const lmClasses = [bemClss.value]
    if (state.error !== null || state.loading === true) return <></> // [WIP] better handling for loading & error states ?
    return <div className={lmClasses.join(' ')}>{
      state.articlesData?.map((articleData, i) => {
        const { url, img, title } = articleData
        const thumbTextContent = <>
          <h3>{title}</h3>
        </>
        return <Thumbnail
          key={url}
          targetUrl={url}
          imageSrc={img}
          contentBelow={thumbTextContent} />
      })
    }</div>
  }
}
