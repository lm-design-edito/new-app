/* Load image assets */
declare module "*.svg";
declare module "*.jpg";
declare module "*.png";
declare module "*.gif" {
  const url: string
  export default url
}
declare module "*.module.scss" {
  const data: { [key: string]: string }
  export default data
}
