import { Vendor } from '@qbit/shared-types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/utils/formatters';
import { formatCurrency } from '@/utils/formatters';
import { FileEdit, Trash2 } from 'lucide-react';

interface VendorDetailProps {
  vendor: Vendor;
  onEdit: () => void;
  onDelete: () => void;
}

export function VendorDetail({ vendor, onEdit, onDelete }: VendorDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">
              {vendor.name}
              <Badge className="ml-2" variant={vendor.isActive ? "outline" : "secondary"}>
                {vendor.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </CardTitle>
            <CardDescription>Vendor #{vendor.vendorNumber}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1" 
              onClick={onEdit}
            >
              <FileEdit className="h-4 w-4" /> Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
              <Separator className="my-2" />
              <div className="space-y-2">
                {vendor.email && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span>{vendor.email}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span>{vendor.phone}</span>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Website</span>
                    <span>
                      <a 
                        href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {vendor.website}
                      </a>
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Address</h3>
              <Separator className="my-2" />
              <div className="space-y-1">
                {vendor.address && <p>{vendor.address}</p>}
                {(vendor.city || vendor.state || vendor.zipCode) && (
                  <p>
                    {vendor.city && `${vendor.city}, `}
                    {vendor.state && `${vendor.state} `}
                    {vendor.zipCode && vendor.zipCode}
                  </p>
                )}
                {vendor.country && <p>{vendor.country}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Business Details</h3>
              <Separator className="my-2" />
              <div className="space-y-2">
                {vendor.taxId && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Tax ID</span>
                    <span>{vendor.taxId}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Payment Terms</span>
                  <span>{vendor.paymentTerms || 'Not specified'}</span>
                </div>
                {vendor.defaultAccountId && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Default Account</span>
                    <span>{vendor.defaultAccountId}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Credit Limit</span>
                  <span>{vendor.creditLimit ? formatCurrency(vendor.creditLimit) : 'Not set'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
              <Separator className="my-2" />
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span>{formatDate(vendor.createdAt)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span>{formatDate(vendor.updatedAt)}</span>
                </div>
                {vendor.notes && (
                  <div className="flex flex-col mt-4">
                    <span className="text-sm text-muted-foreground">Notes</span>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{vendor.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 