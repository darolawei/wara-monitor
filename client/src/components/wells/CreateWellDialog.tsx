import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, MapPin, Droplets, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateWell } from "@/hooks/use-wells";
import { useToast } from "@/hooks/use-toast";
import { PNG_PROVINCES } from "@shared/provinces";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  location: z.string().min(2, "Location must be at least 2 characters."),
  province: z.string().min(1, "Please select a province."),
  currentSalinity: z.coerce.number().min(0, "Salinity cannot be negative."),
});

interface CreateWellDialogProps {
  defaultProvince?: string;
}

export function CreateWellDialog({ defaultProvince }: CreateWellDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createWell = useCreateWell();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      province: defaultProvince || "",
      currentSalinity: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createWell.mutate(
      {
        ...values,
        currentSalinity: String(values.currentSalinity),
        status: values.currentSalinity > 3 ? 'danger' : values.currentSalinity >= 1 ? 'warning' : 'safe'
      } as any,
      {
        onSuccess: () => {
          toast({
            title: "Well Registered Successfully",
            description: `${values.name} has been added to the monitoring system.`,
          });
          setOpen(false);
          form.reset({ name: "", location: "", province: defaultProvince || "", currentSalinity: 0 });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.message,
          });
        }
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all" data-testid="button-open-create-well">
          <Plus className="w-4 h-4" />
          Register New Well
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Register New Well</DialogTitle>
          <DialogDescription>
            Add a new coastal well to the Wara-Monitor PNG system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Well Name / Identifier</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="e.g., Hanuabada Community Well 1" className="pl-10 rounded-xl" data-testid="input-well-name" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl" data-testid="select-province">
                        <SelectValue placeholder="Select a PNG province" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {PNG_PROVINCES.map((p) => (
                        <SelectItem key={p} value={p} data-testid={`option-province-${p.toLowerCase().replace(/\s+/g, '-')}`}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="e.g., Motu Koita Village" className="pl-10 rounded-xl" data-testid="input-well-location" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Village, district, or landmark within the province.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentSalinity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Salinity Reading (ppt)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="rounded-xl font-mono"
                      data-testid="input-well-salinity"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Parts per thousand. {`< 1.0`} is safe, {`> 3.0`} is danger.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl"
                disabled={createWell.isPending}
                data-testid="button-submit-well"
              >
                {createWell.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Well"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
