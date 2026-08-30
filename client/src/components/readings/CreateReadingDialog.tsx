import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Activity, Loader2 } from "lucide-react";
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
import { useCreateReading } from "@/hooks/use-readings";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  salinity: z.coerce.number().min(0, "Salinity cannot be negative."),
});

interface CreateReadingDialogProps {
  wellId: number;
  wellName: string;
}

export function CreateReadingDialog({ wellId, wellName }: CreateReadingDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createReading = useCreateReading();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salinity: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createReading.mutate(
      {
        wellId,
        salinity: String(values.salinity),
      }, 
      {
      onSuccess: () => {
        toast({
          title: "Reading Recorded",
          description: `New salinity level of ${values.salinity} ppt added to ${wellName}.`,
        });
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: error.message,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <Activity className="w-4 h-4" />
          Log Manual Reading
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Log Salinity Reading</DialogTitle>
          <DialogDescription>
            Manually enter a new sensor reading for <strong>{wellName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            
            <FormField
              control={form.control}
              name="salinity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salinity Level (ppt)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g., 1.45" 
                      className="rounded-xl font-mono text-lg py-6" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Values above 3.0 ppt indicate severe saltwater intrusion.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={createReading.isPending}
              >
                {createReading.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Reading"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
