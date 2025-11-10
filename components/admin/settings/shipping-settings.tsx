'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const shippingSettingsSchema = z.object({
  freeShippingThreshold: z.number().min(0),
  flatRate: z.number().min(0),
  enableFlatRate: z.boolean(),
  enableFreeShipping: z.boolean(),
  processingTime: z.string().min(1),
});

type ShippingSettingsValues = z.infer<typeof shippingSettingsSchema>;

export default function ShippingSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<ShippingSettingsValues>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: {
      freeShippingThreshold: 50,
      flatRate: 5.99,
      enableFlatRate: true,
      enableFreeShipping: true,
      processingTime: '1-2 business days',
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        form.reset(data.shipping);
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setIsFetching(false);
      }
    }
    fetchSettings();
  }, [form]);

  async function onSubmit(data: ShippingSettingsValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'shipping', settings: data }),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast.success('Shipping settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="enableFlatRate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Flat Rate Shipping
                    </FormLabel>
                    <FormDescription>
                      Charge a fixed shipping fee for all orders
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('enableFlatRate') && (
              <FormField
                control={form.control}
                name="flatRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flat Rate Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="5.99"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Fixed shipping cost for all orders
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="enableFreeShipping"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Free Shipping
                    </FormLabel>
                    <FormDescription>
                      Offer free shipping above a threshold
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('enableFreeShipping') && (
              <FormField
                control={form.control}
                name="freeShippingThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Free Shipping Threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="50"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum order amount for free shipping
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="processingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Processing Time</FormLabel>
                  <FormControl>
                    <Input placeholder="1-2 business days" {...field} />
                  </FormControl>
                  <FormDescription>
                    Time to process orders before shipping
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
