import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Customer, CreateCustomerDto } from '@qbit/shared-types';

// Form validation schema
const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  position: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

const customerSchema = z.object({
  customerNumber: z.string().optional(),
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  creditLimit: z.number().positive().optional().or(z.literal('')),
  contacts: z.array(contactSchema).optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CreateCustomerDto) => void;
  isLoading?: boolean;
}

export function CustomerForm({ initialData, onSubmit, isLoading = false }: CustomerFormProps) {
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Initialize form with default values
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData ? {
      ...initialData,
      creditLimit: initialData.creditLimit ? Number(initialData.creditLimit) : undefined,
    } : {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      taxId: '',
      website: '',
      notes: '',
      isActive: true,
      contacts: [],
    },
  });

  // Field array for contacts
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts',
  });

  // Add a new contact
  const addContact = () => {
    append({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      isPrimary: fields.length === 0, // First contact is primary by default
    });
  };

  // Handle form submission
  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      // Convert creditLimit from string to number if provided
      const formattedValues = {
        ...values,
        creditLimit: values.creditLimit === '' ? undefined : Number(values.creditLimit),
      };
      
      await onSubmit(formattedValues);
      if (!initialData) {
        form.reset(); // Reset form after successful creation
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the customer.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Enter the basic information about the customer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Number - Only show if editing */}
                {initialData && (
                  <FormField
                    control={form.control}
                    name="customerNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Number</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Customer Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="info@acme.com" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="555-123-4567" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Credit Limit */}
                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Limit</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10000"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? '' : parseFloat(value));
                          }}
                          value={field.value === undefined ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Active Status */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Inactive customers won't appear in regular searches.
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>
                Enter the address and location details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* State */}
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Zip Code */}
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip/Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="94105" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="USA" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Additional details about the customer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tax ID */}
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID/EIN</FormLabel>
                      <FormControl>
                        <Input placeholder="12-3456789" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Website */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.acme.com" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes about the customer..." 
                            className="min-h-[100px]"
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Contacts</CardTitle>
                <CardDescription>
                  Add contact persons for this customer.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={addContact}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Contact
              </Button>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No contacts added yet. Click "Add Contact" to add a contact person.
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-4">
                  {fields.map((field, index) => (
                    <AccordionItem key={field.id} value={`contact-${index}`} className="border rounded-lg">
                      <AccordionTrigger className="px-4">
                        <span className="text-left">
                          {form.watch(`contacts.${index}.firstName`) || form.watch(`contacts.${index}.lastName`) 
                            ? `${form.watch(`contacts.${index}.firstName`)} ${form.watch(`contacts.${index}.lastName`)}` 
                            : `Contact #${index + 1}`}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* First Name */}
                          <FormField
                            control={form.control}
                            name={`contacts.${index}.firstName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name*</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Last Name */}
                          <FormField
                            control={form.control}
                            name={`contacts.${index}.lastName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Email */}
                          <FormField
                            control={form.control}
                            name={`contacts.${index}.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="john.doe@acme.com" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Phone */}
                          <FormField
                            control={form.control}
                            name={`contacts.${index}.phone`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="555-987-6543" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Position */}
                          <FormField
                            control={form.control}
                            name={`contacts.${index}.position`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position</FormLabel>
                                <FormControl>
                                  <Input placeholder="Purchasing Manager" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Is Primary */}
                          <FormField
                            control={form.control}
                            name={`contacts.${index}.isPrimary`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-[66px]">
                                <FormLabel className="text-base">Primary Contact</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      // If setting this contact as primary, set all others to not primary
                                      if (checked) {
                                        fields.forEach((_, i) => {
                                          if (i !== index) {
                                            form.setValue(`contacts.${i}.isPrimary`, false);
                                          }
                                        });
                                      }
                                      field.onChange(checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-4 flex justify-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update Customer' : 'Create Customer'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

// Missing function for FormDescription - adding it for completeness
function FormDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
} 