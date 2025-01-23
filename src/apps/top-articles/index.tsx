import { Cast } from "@design-edito/tools/agnostic/misc/cast";
import { isRecord } from "@design-edito/tools/agnostic/objects/is-record";
import { recordFormat } from "@design-edito/tools/agnostic/objects/record-format";
import { Apps } from "~/apps";
import TopArticles, { Props, TopArticle } from "~/components/TopArticles";

export { Props };

const API_URL = "https://stg-forecast.lemonde.fr/api/v1/top-articles"; // dev
// const API_URL = 'https://forecast.lemonde.fr/api/v1'; // prod

const FAKE_DATA = [
  {
    title:
      "Stargate, le projet \u00e0 500\u00a0milliards de dollars de Donald Trump pour doper l\u2019intelligence artificielle",
    description:
      "Le pr\u00e9sident am\u00e9ricain a d\u00e9voil\u00e9, mardi 21\u00a0janvier, ce projet destin\u00e9 \u00e0 b\u00e2tir les centres de donn\u00e9es g\u00e9ants de la future g\u00e9n\u00e9ration d\u2019IA, \u00e9labor\u00e9 par Oracle, OpenAI et SoftBank. Soit 100\u00a0milliards de dollars investis tout de suite, auxquels doivent s\u2019ajouter 400\u00a0milliards d\u2019ici \u00e0\u00a02029.",
    img: "https://img.lemde.fr/2025/01/21/0/0/6000/4000/600/0/60/0/5bed3a9_ftp-import-images-1-co8kwagj8muk-2025-01-21t231530z-1717923386-rc2necav5yt3-rtrmadp-3-usa-trump.JPG",
    free: "0",
    author: "Arnaud Leparmentier",
    section: "\u00c9conomie",
    subSection: "L'investiture de Donald Trump",
    keywords:
      "L'investiture de Donald Trump,Donald Trump,\u00c9tats-Unis,Am\u00e9riques,International,\u00c9conomie",
    publishedAt: "2025-01-22 06:46:30",
    modifiedAt: "2025-01-22 11:24:05",
    url: "https://www.lemonde.fr/economie/article/2025/01/22/le-mandat-trump-commence-par-une-pluie-de-centaines-de-milliards-dollars-destines-l-intelligence-artificielle_6509500_3234.html",
    pageview: "99885",
    uniquePageview: "87175",
    readingRate: "56.3435",
    readingTime: "30.365800793283746",
    totalShare: "0",
    shareRate: "0",
    shareFb: "0",
    shareTw: "0",
    shareMail: "0",
    comment: "102",
    commentRate: "0.0011700602143186706",
    gift: "0",
    tunnelAccess: "0",
    abortion: "0",
    conversion: "0",
    conversionRate: "0",
    unsubwill: "0",
    churn: "0",
  },
  {
    title:
      "Face au risque d\u2019une guerre commerciale de Trump, quelle riposte des Europ\u00e9ens\u00a0?",
    description:
      "Donald Trump promet des barri\u00e8res douani\u00e8res aux Europ\u00e9ens. Faut-il r\u00e9pondre du tac au tac ou \u00e9viter l\u2019escalade\u00a0? Les Europ\u00e9ens sont divis\u00e9s autour de cet enjeu \u00e0 1\u00a0500\u00a0milliards d\u2019euros. Et leurs moyens de r\u00e9torsion plut\u00f4t limit\u00e9s.",
    img: "https://img.lemde.fr/2025/01/21/0/1/3069/2046/600/0/60/0/9cacddf_sirius-fs-upload-1-pkoh0krlakfh-1737483275124-media-appel-eco-3x.png",
    free: "0",
    author: "Eric Albert",
    section: "\u00c9conomie",
    subSection: "L'investiture de Donald Trump",
    keywords:
      "L'investiture de Donald Trump,Donald Trump,\u00c9tats-Unis,Am\u00e9riques,International,\u00c9conomie",
    publishedAt: "2025-01-22 10:00:01",
    modifiedAt: "2025-01-22 10:40:35",
    url: "https://www.lemonde.fr/economie/article/2025/01/22/face-au-risque-d-une-guerre-commerciale-de-trump-quelle-riposte-des-europeens_6509819_3234.html",
    pageview: "33327",
    uniquePageview: "29820",
    readingRate: "54.3019",
    readingTime: "42.19933738980335",
    totalShare: "0",
    shareRate: "0",
    shareFb: "0",
    shareTw: "0",
    shareMail: "0",
    comment: "21",
    commentRate: "0.0007042253424748381",
    gift: "0",
    tunnelAccess: "0",
    abortion: "0",
    conversion: "0",
    conversionRate: "0",
    unsubwill: "0",
    churn: "0",
  },
];

export default async function renderer(
  unknownProps: unknown,
  id: string
): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id);
  let topArticles: TopArticle[] = [];

  // Fetch articles
  try {
    const orderBy = props?.orderBy || "pageview";
    const paramsObj = {
      ...(props?.lang ? { lang: props?.lang } : {}),
      ...(props?.device ? { device: props?.device } : {}),
      ...(props?.medium ? { medium: props?.medium } : {}),
    };
    const urlSearchParams = new URLSearchParams(paramsObj);
    const apiUrl = `${API_URL}/${orderBy}${Object.keys(paramsObj).length ? `?${urlSearchParams.toString()}` : ""
      }`;

    console.log({ apiUrl });
    const res = await fetch(apiUrl);
    const resArticles: TopArticle[] = await res.json();
    topArticles =
      (await arrayToTopArticles(resArticles).then((articles) =>
        articles?.map((article) => article)
      )) || [];
  } catch (e) {
    topArticles =
      (await arrayToTopArticles(FAKE_DATA).then((articles) =>
        articles?.map((article) => article)
      )) || [];
  }

  console.log({ topArticles, FAKE_DATA });
  return {
    props: {
      ...props,
      topArticles,
    },
    Component: TopArticles,
  };
}

async function toProps(input: unknown, id: string): Promise<Props> {
  return (
    (await Apps.toPropsHelper(input, {
      orderBy: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      lang: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      device: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      medium: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      since: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      publishedSince: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      free: (i) => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      prefilters: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      excludedSections: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      excludedSubsections: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      section: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      subSection: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      author: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
      itemNumber: (i) => Apps.ifNotUndefinedHelper(i, Cast.toNumber),
      page: (i) => Apps.ifNotUndefinedHelper(i, Cast.toNumber),
      orderByDirection: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),

      withImage: (i) => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      withTitle: (i) => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      withDate: (i) => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      dateFormat: (i) => Apps.ifNotUndefinedHelper(i, Cast.toRecord),
      withCredits: (i) => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      withSection: (i) => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      withSubSection: (i) => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      withDescription: (i) => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
    })) ?? {}
  );
}

const toDate = (val: unknown) =>
  typeof val === "string" ? new Date(val) : undefined;

async function arrayToTopArticles(
  array: unknown[]
): Promise<Props["topArticles"]> {
  const topArticles: NonNullable<Props["topArticles"]> = [];
  for (const item of array) {
    if (!isRecord(item)) continue;
    const article: NonNullable<Props["topArticles"]>[number] =
      await recordFormat(item, {
        title: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
        url: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
        img: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
        free: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
        author: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
        section: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
        description: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
        subSection: (i) => Apps.ifNotUndefinedHelper(i, Cast.toString),
        publishedAt: (i) => Apps.ifNotUndefinedHelper(i, toDate),
        modifiedAt: (i) => Apps.ifNotUndefinedHelper(i, toDate),
      });
    topArticles.push(article);
  }
  return topArticles;
}
