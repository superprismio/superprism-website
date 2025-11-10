declare module "react-resizable-panels" {
  import * as React from "react";

  export interface PanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    direction?: "horizontal" | "vertical";
  }

  export type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    order?: number;
  };

  export interface PanelResizeHandleProps
    extends React.HTMLAttributes<HTMLDivElement> {
    withHandle?: boolean;
  }

  export const PanelGroup: React.ForwardRefExoticComponent<
    PanelGroupProps & React.RefAttributes<HTMLDivElement>
  >;

  export const Panel: React.ForwardRefExoticComponent<
    PanelProps & React.RefAttributes<HTMLDivElement>
  >;

  export const PanelResizeHandle: React.ForwardRefExoticComponent<
    PanelResizeHandleProps & React.RefAttributes<HTMLDivElement>
  >;
}

