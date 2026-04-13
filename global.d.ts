// Allow side-effect CSS imports (e.g. import "./mdx.css")
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
