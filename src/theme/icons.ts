import appConfig from '~/config'

const rootUrl = appConfig.paths.SHARED_ASSETS_ICONS_URL

export enum Name {
  ALERT = 'alert',
  BOOKMARK_FILLED = 'bookmark-filled',
  CHEVRON_DOWN = 'chevron-down',
  COMMENT_OUTLINE = 'comment-outline',
  FACEBOOK = 'facebook',
  INFO = 'info',
  LINKEDIN = 'linkedin',
  PAYMENT = 'payment',
  SCHEDULE = 'schedule',
  STAR_OUTLINE = 'star-outline',
  YOUTUBE = 'youtube',
  ARCHIVES = 'archives',
  BOOKMARK_OUTLINE = 'bookmark-outline',
  CHEVRON_NEXT = 'chevron-next',
  COPY = 'copy',
  FR = 'fr',
  INFOGRAPHIE = 'infographie',
  LIST = 'list',
  PLUS = 'plus',
  SEARCH = 'search',
  TICK = 'tick',
  ARROW_BACK = 'arrow-back',
  BURGER = 'burger',
  CHEVRON_UP = 'chevron-up',
  DANGER = 'danger',
  FULLSCREEN = 'fullscreen',
  INSTAGRAM = 'instagram',
  LOGO_M = 'logo-m',
  PODCAST = 'podcast',
  SHARE_FILLED = 'share-filled',
  UPDATE = 'update',
  ARROW_DOWN = 'arrow-down',
  CART = 'cart',
  CHRONO = 'chrono',
  EMAIL_FILLED = 'email-filled',
  GIFT = 'gift',
  LEGEND = 'legend',
  MASK_PWD = 'mask-pwd',
  PORTFOLIO = 'portfolio',
  SHARE_OUTLINE = 'share-outline',
  VIDEO = 'video',
  ARROW_NEXT = 'arrow-next',
  CHECK = 'check',
  CLOSE = 'close',
  EMAIL_OUTLINE = 'email-outline',
  HELP = 'help',
  LEMONDE = 'lemonde',
  MESSENGER = 'messenger',
  REDUCE = 'reduce',
  SHOW_PWD = 'show-pwd',
  WHATSAPP = 'whatsapp',
  ARROW_UP = 'arrow-up',
  CHEVRON_BACK = 'chevron-back',
  COMMENT_FILLED = 'comment-filled',
  EN = 'en',
  HOME = 'home',
  LINK = 'link',
  NEWSPAPER = 'newspaper',
  REFERENCE = 'reference',
  STAR_FILLED = 'star-filled',
  WORKBAG = 'workbag'
}

const iconsData = new Map<string, { url: URL, description: string }>()

iconsData.set(Name.ALERT,            { url: new URL(`${rootUrl}/alert.svg`),            description: 'Icône cloche' })
iconsData.set(Name.ARCHIVES,         { url: new URL(`${rootUrl}/archives.svg`),         description: 'Icône pile de papiers' })
iconsData.set(Name.ARROW_BACK,       { url: new URL(`${rootUrl}/arrow-back.svg`),       description: 'Icône flèche pointant vers la gauche' })
iconsData.set(Name.ARROW_DOWN,       { url: new URL(`${rootUrl}/arrow-down.svg`),       description: 'Icône flèche pointant vers le bas' })
iconsData.set(Name.ARROW_NEXT,       { url: new URL(`${rootUrl}/arrow-next.svg`),       description: 'Icône flèche pointant vers la droite' })
iconsData.set(Name.ARROW_UP,         { url: new URL(`${rootUrl}/arrow-up.svg`),         description: 'Icône flèche pointant vers le haut' })
iconsData.set(Name.BOOKMARK_FILLED,  { url: new URL(`${rootUrl}/bookmark-filled.svg`),  description: 'Icône marque page rempli' })
iconsData.set(Name.BOOKMARK_OUTLINE, { url: new URL(`${rootUrl}/bookmark-outline.svg`), description: 'Icône marque page non rempli' })
iconsData.set(Name.BURGER,           { url: new URL(`${rootUrl}/burger.svg`),           description: 'Icône bouton menu' })
iconsData.set(Name.CART,             { url: new URL(`${rootUrl}/cart.svg`),             description: 'Icône panier de courses' })
iconsData.set(Name.CHECK,            { url: new URL(`${rootUrl}/check.svg`),            description: 'Icône marque de validation' })
iconsData.set(Name.CHEVRON_BACK,     { url: new URL(`${rootUrl}/chevron-back.svg`),     description: 'Icône chevron vers la gauche' })
iconsData.set(Name.CHEVRON_DOWN,     { url: new URL(`${rootUrl}/chevron-down.svg`),     description: 'Icône chevron vers le bas' })
iconsData.set(Name.CHEVRON_NEXT,     { url: new URL(`${rootUrl}/chevron-next.svg`),     description: 'Icône chevron vers la droite' })
iconsData.set(Name.CHEVRON_UP,       { url: new URL(`${rootUrl}/chevron-up.svg`),       description: 'Icône chevron vers le haut' })
iconsData.set(Name.CHRONO,           { url: new URL(`${rootUrl}/chrono.svg`),           description: 'Icône chronomètre' })
iconsData.set(Name.CLOSE,            { url: new URL(`${rootUrl}/close.svg`),            description: 'Icône croix de fermeture' })
iconsData.set(Name.COMMENT_FILLED,   { url: new URL(`${rootUrl}/comment-filled.svg`),   description: 'Icône bulle de commentaire remplie' })
iconsData.set(Name.COMMENT_OUTLINE,  { url: new URL(`${rootUrl}/comment-outline.svg`),  description: 'Icône bulle de commentaire non remplie' })
iconsData.set(Name.COPY,             { url: new URL(`${rootUrl}/copy.svg`),             description: 'Icône "copier"' })
iconsData.set(Name.DANGER,           { url: new URL(`${rootUrl}/danger.svg`),           description: 'Icône point d\'exlamation' })
iconsData.set(Name.EMAIL_FILLED,     { url: new URL(`${rootUrl}/email-filled.svg`),     description: 'Icône e-mail rempli' })
iconsData.set(Name.EMAIL_OUTLINE,    { url: new URL(`${rootUrl}/email-outline.svg`),    description: 'Icône e-mail non rempli' })
iconsData.set(Name.EN,               { url: new URL(`${rootUrl}/en.svg`),               description: 'Icône "english"' })
iconsData.set(Name.FACEBOOK,         { url: new URL(`${rootUrl}/facebook.svg`),         description: 'Icône Facebook' })
iconsData.set(Name.FR,               { url: new URL(`${rootUrl}/fr.svg`),               description: 'Icône "français"' })
iconsData.set(Name.FULLSCREEN,       { url: new URL(`${rootUrl}/fullscreen.svg`),       description: 'Icône agrandir / plein écran' })
iconsData.set(Name.GIFT,             { url: new URL(`${rootUrl}/gift.svg`),             description: 'Icône cadeau' })
iconsData.set(Name.HELP,             { url: new URL(`${rootUrl}/help.svg`),             description: 'Icône point d\'interrogation' })
iconsData.set(Name.HOME,             { url: new URL(`${rootUrl}/home.svg`),             description: 'Icône maison' })
iconsData.set(Name.INFO,             { url: new URL(`${rootUrl}/info.svg`),             description: 'Icône info' })
iconsData.set(Name.INFOGRAPHIE,      { url: new URL(`${rootUrl}/infographie.svg`),      description: 'Icône diagramme en barres' })
iconsData.set(Name.INSTAGRAM,        { url: new URL(`${rootUrl}/instagram.svg`),        description: 'Icône Instagram' })
iconsData.set(Name.LEGEND,           { url: new URL(`${rootUrl}/legend.svg`),           description: 'Icône texte additionnel' })
iconsData.set(Name.LEMONDE,          { url: new URL(`${rootUrl}/lemonde.svg`),          description: 'Icône Le Monde' })
iconsData.set(Name.LINK,             { url: new URL(`${rootUrl}/link.svg`),             description: 'Icône lien' })
iconsData.set(Name.LINKEDIN,         { url: new URL(`${rootUrl}/linkedin.svg`),         description: 'Icône Linkedin' })
iconsData.set(Name.LIST,             { url: new URL(`${rootUrl}/list.svg`),             description: 'Icône liste à puces' })
iconsData.set(Name.LOGO_M,           { url: new URL(`${rootUrl}/logo-m.svg`),           description: 'Icône logo M' })
iconsData.set(Name.MASK_PWD,         { url: new URL(`${rootUrl}/mask-pwd.svg`),         description: 'Icône masquer' })
iconsData.set(Name.MESSENGER,        { url: new URL(`${rootUrl}/messenger.svg`),        description: 'Icône messenger' })
iconsData.set(Name.NEWSPAPER,        { url: new URL(`${rootUrl}/newspaper.svg`),        description: 'Icône journal' })
iconsData.set(Name.PAYMENT,          { url: new URL(`${rootUrl}/payment.svg`),          description: 'Icône carte bleue' })
iconsData.set(Name.PLUS,             { url: new URL(`${rootUrl}/plus.svg`),             description: 'Icône plus' })
iconsData.set(Name.PODCAST,          { url: new URL(`${rootUrl}/podcast.svg`),          description: 'Icône microphone' })
iconsData.set(Name.PORTFOLIO,        { url: new URL(`${rootUrl}/portfolio.svg`),        description: 'Icône appareil photo' })
iconsData.set(Name.REDUCE,           { url: new URL(`${rootUrl}/reduce.svg`),           description: 'Icône réduire' })
iconsData.set(Name.REFERENCE,        { url: new URL(`${rootUrl}/reference.svg`),        description: 'Icône pied de mouche' })
iconsData.set(Name.SCHEDULE,         { url: new URL(`${rootUrl}/schedule.svg`),         description: 'Icône calendrier' })
iconsData.set(Name.SEARCH,           { url: new URL(`${rootUrl}/search.svg`),           description: 'Icône loupe' })
iconsData.set(Name.SHARE_FILLED,     { url: new URL(`${rootUrl}/share-filled.svg`),     description: 'Icône flèche partage remplie' })
iconsData.set(Name.SHARE_OUTLINE,    { url: new URL(`${rootUrl}/share-outline.svg`),    description: 'Icône flèche partage non remplie' })
iconsData.set(Name.SHOW_PWD,         { url: new URL(`${rootUrl}/show-pwd.svg`),         description: 'Icône rendre visible' })
iconsData.set(Name.STAR_FILLED,      { url: new URL(`${rootUrl}/star-filled.svg`),      description: 'Icône étoile remplie' })
iconsData.set(Name.STAR_OUTLINE,     { url: new URL(`${rootUrl}/star-outline.svg`),     description: 'Icône étoile non remplie' })
iconsData.set(Name.TICK,             { url: new URL(`${rootUrl}/tick.svg`),             description: 'Icône marque de validation' })
iconsData.set(Name.UPDATE,           { url: new URL(`${rootUrl}/update.svg`),           description: 'Icône horloge avec flèche à rebours' })
iconsData.set(Name.VIDEO,            { url: new URL(`${rootUrl}/video.svg`),            description: 'Icône bouton play' })
iconsData.set(Name.WHATSAPP,         { url: new URL(`${rootUrl}/whatsapp.svg`),         description: 'Icône Whatsapp' })
iconsData.set(Name.WORKBAG,          { url: new URL(`${rootUrl}/workbag.svg`),          description: 'Icône cartable' })
iconsData.set(Name.YOUTUBE,          { url: new URL(`${rootUrl}/youtube.svg`),          description: 'Icône YouTube' })

export default iconsData
