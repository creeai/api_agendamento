declare module "swagger-ui-react" {
  import {Component} from "react"

  export interface SwaggerUIProps {
    spec?: any
    url?: string
    [key: string]: any
  }

  export default class SwaggerUI extends Component<SwaggerUIProps> {}
}

declare module "swagger-ui-react/swagger-ui.css" {
  const content: string
  export default content
}
