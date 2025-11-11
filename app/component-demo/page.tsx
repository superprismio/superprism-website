
import type { ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Example({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">{children}</div>
  );
}

export default function ComponentsShowcase() {
  return (
    <div className="flex w-full flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl space-y-12 px-6 py-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            UI Components Showcase
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse every component available under <code>@/components/ui</code>.
          </p>
        </header>

        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Accordion</h2>
            <Example>
              <Accordion
                type="single"
                collapsible
                className="w-full max-w-md space-y-2"
                defaultValue="item-1"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Haus OS?</AccordionTrigger>
                  <AccordionContent>
                    Haus OS is a UI starter kit featuring shadcn components and
                    Haus data primitives.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I customize styles?</AccordionTrigger>
                  <AccordionContent>
                    Tailwind tokens power all styles. Override tokens or adjust
                    classNames to suit your project.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Alert</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Example>
                <Alert>
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>
                    You can use alerts to provide contextual feedback for system
                    messages.
                  </AlertDescription>
                </Alert>
              </Example>
              <Example>
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Something went wrong. Please retry the previous action.
                  </AlertDescription>
                </Alert>
              </Example>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Avatar</h2>
            <Example>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Badge</h2>
            <Example>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Breadcrumb</h2>
            <Example>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Projects</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Haus OS</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Components</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Button</h2>
            <Example>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Variants
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Sizes</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button>Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon" aria-label="Add">
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Card</h2>
            <Example>
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>
                    Quickly bootstrap a new experience with Haus components.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Use cards to group related data and actions. They are flexible
                    and adapt to any content.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Dismiss</Button>
                  <Button>Continue</Button>
                </CardFooter>
              </Card>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Checkbox</h2>
            <Example>
              <div className="flex items-center gap-3">
                <Checkbox id="show-archived" defaultChecked />
                <Label htmlFor="show-archived">Show archived items</Label>
              </div>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Collapsible</h2>
            <Example>
              <Collapsible className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">Deploy steps</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm">
                      Toggle
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="text-sm text-muted-foreground">
                  <p>
                    1. Install dependencies
                    <br />
                    2. Run database migrations
                    <br />
                    3. Deploy to production
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Command</h2>
            <Example>
              <Command className="max-w-lg">
                <CommandInput placeholder="Search components..." />
                <CommandList>
                  <CommandEmpty>No components found.</CommandEmpty>
                  <CommandGroup heading="Collections">
                    <CommandItem>
                      Dashboard
                      <CommandShortcut>⌘D</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                      Components
                      <CommandShortcut>⌘K</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Links">
                    <CommandItem>Documentation</CommandItem>
                    <CommandItem>Support</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Dialog</h2>
            <Example>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open dialog</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Invite teammate</DialogTitle>
                    <DialogDescription>
                      Send an invitation to collaborate on this workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2 py-4">
                    <Label htmlFor="invite-email">Email</Label>
                    <Input id="invite-email" placeholder="name@company.com" />
                  </div>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Send invite</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Dropdown Menu</h2>
            <Example>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      Profile
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team settings</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Input</h2>
            <Example>
              <div className="space-y-2">
                <Label htmlFor="project-name">Project name</Label>
                <Input id="project-name" placeholder="Haus OS Starter" />
              </div>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Label</h2>
            <Example>
              <div className="flex items-center gap-3">
                <Switch id="notifications" defaultChecked />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Navigation Menu</h2>
            <Example>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Overview</NavigationMenuTrigger>
                    <NavigationMenuContent className="p-4">
                      <div className="grid w-[320px] gap-3">
                        <NavigationMenuLink
                          className="rounded-md border p-3 text-sm shadow-sm hover:bg-accent"
                          href="#"
                        >
                          Learn how to stitch Haus data with your product.
                        </NavigationMenuLink>
                        <NavigationMenuLink
                          className="rounded-md border p-3 text-sm shadow-sm hover:bg-accent"
                          href="#"
                        >
                          Browse component usage guidelines.
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                    <NavigationMenuContent className="p-4">
                      <div className="grid w-[220px] gap-2">
                        <NavigationMenuLink
                          className="rounded-md border p-3 text-sm shadow-sm hover:bg-accent"
                          href="#buttons"
                        >
                          Buttons
                        </NavigationMenuLink>
                        <NavigationMenuLink
                          className="rounded-md border p-3 text-sm shadow-sm hover:bg-accent"
                          href="#inputs"
                        >
                          Inputs
                        </NavigationMenuLink>
                        <NavigationMenuLink
                          className="rounded-md border p-3 text-sm shadow-sm hover:bg-accent"
                          href="#overlays"
                        >
                          Overlays
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
                <NavigationMenuIndicator />
              </NavigationMenu>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Pagination</h2>
            <Example>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">8</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Popover</h2>
            <Example>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Show popover</Button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-64 space-y-2">
                  <h3 className="text-sm font-semibold">Team access</h3>
                  <p className="text-sm text-muted-foreground">
                    Popovers are great for contextual editing and additional
                    information.
                  </p>
                  <Button size="sm" className="w-full">
                    Share link
                  </Button>
                </PopoverContent>
              </Popover>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Progress</h2>
            <Example>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Uploading files (62%)
                </p>
                <Progress value={62} className="w-full" />
              </div>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Radio Group</h2>
            <Example>
              <RadioGroup defaultValue="professional" className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="free-plan" value="free" />
                  <Label htmlFor="free-plan">Free</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="pro-plan" value="professional" />
                  <Label htmlFor="pro-plan">Professional</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="enterprise-plan" value="enterprise" />
                  <Label htmlFor="enterprise-plan">Enterprise</Label>
                </div>
              </RadioGroup>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Resizable</h2>
            <Example>
              <ResizablePanelGroup
                direction="horizontal"
                className="w-full max-w-4xl overflow-hidden rounded-lg border"
              >
                <ResizablePanel defaultSize={40}>
                  <div className="flex h-full min-h-[220px] items-center justify-center bg-muted/40 p-6">
                    <span className="font-medium">Sidebar</span>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={60}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={60}>
                      <div className="flex h-full items-center justify-center bg-muted/20 p-6">
                        <span className="font-medium">Content</span>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={40}>
                      <div className="flex h-full items-center justify-center bg-muted/30 p-6">
                        <span className="font-medium">Details</span>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Select</h2>
            <Example>
              <Select defaultValue="weekly">
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select cadence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Cadence</SelectLabel>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Other</SelectLabel>
                    <SelectItem value="custom">Custom schedule</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Sheet</h2>
            <Example>
              <Sheet>
                <SheetTrigger asChild>
                  <Button>Open sheet</Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-sm">
                  <SheetHeader>
                    <SheetTitle>Project settings</SheetTitle>
                    <SheetDescription>
                      Manage visibility, access, and integrations in one place.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="sheet-name">Project name</Label>
                      <Input id="sheet-name" defaultValue="Haus OS Starter" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sheet-about">About</Label>
                      <Textarea
                        id="sheet-about"
                        rows={3}
                        defaultValue="A collaborative OS built on top of Haus primitives."
                      />
                    </div>
                  </div>
                  <SheetFooter className="flex justify-end gap-2">
                    <SheetClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button>Save</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Skeleton</h2>
            <Example>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Slider</h2>
            <Example>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Notification volume
                </p>
                <Slider defaultValue={[40]} max={100} step={10} className="w-full" />
              </div>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Switch</h2>
            <Example>
              <div className="flex items-center gap-3">
                <Switch id="beta-access" />
                <Label htmlFor="beta-access">Enable beta features</Label>
              </div>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Table</h2>
            <Example>
              <Table>
                <TableCaption>Recent workspace activity.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Alex Johnson</TableCell>
                    <TableCell>Created a new space</TableCell>
                    <TableCell>Nov 2</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Maya Chen</TableCell>
                    <TableCell>Shared a document</TableCell>
                    <TableCell>Nov 3</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Jordan Lee</TableCell>
                    <TableCell>Updated permissions</TableCell>
                    <TableCell>Nov 4</TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right">
                      Showing 3 of 8 entries
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Tabs</h2>
            <Example>
              <Tabs defaultValue="account" className="w-full max-w-lg">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="pt-4 text-sm">
                  Manage your personal information, authentication, and connected
                  identities.
                </TabsContent>
                <TabsContent value="notifications" className="pt-4 text-sm">
                  Configure email, push, and in-app notifications.
                </TabsContent>
                <TabsContent value="billing" className="pt-4 text-sm">
                  Update payment details and review invoices.
                </TabsContent>
              </Tabs>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Textarea</h2>
            <Example>
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  rows={4}
                  placeholder="Share ideas to improve the workspace..."
                />
              </div>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Toast</h2>
            <Example>
              <ToastProvider>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Toasts appear in the corner to share transient messages.
                  </p>
                  <Toast defaultOpen>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <ToastTitle>Project saved</ToastTitle>
                          <ToastDescription>
                            We synced your latest changes a moment ago.
                          </ToastDescription>
                        </div>
                        <ToastAction altText="Undo save" asChild>
                          <Button size="sm" variant="outline">
                            Undo
                          </Button>
                        </ToastAction>
                      </div>
                    </div>
                  </Toast>
                  <ToastViewport />
                </div>
              </ToastProvider>
            </Example>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Tooltip</h2>
            <Example>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>Quick helper text goes here.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Example>
          </section>
        </div>
      </div>
    </div>
  );
}
