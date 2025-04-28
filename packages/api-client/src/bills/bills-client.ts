import { ApiClientBase } from '../utils/api-client-base';
import { Bill, CreateBillDto, UpdateBillDto } from '@qbit/shared-types';

export class BillsClient extends ApiClientBase {
  /**
   * Fetches all bills
   */
  async getAllBills(params?: {
    page?: number | null;
    limit?: number | null;
    status?: string | null;
    search?: string | null;
  }): Promise<Bill[]> {
    return this.get<Bill[]>('/accounts-payable/bills', { params });
  }

  /**
   * Fetches a specific bill by ID
   */
  async getBillById(id: string | number): Promise<Bill> {
    return this.get<Bill>(`/accounts-payable/bills/${id}`);
  }

  /**
   * Fetches bills for a specific vendor
   */
  async getBillsByVendor(
    vendorId: string | number,
    params?: {
      status?: string | null;
      search?: string | null;
      page?: number | null;
      limit?: number | null;
    },
  ): Promise<Bill[]> {
    return this.get<Bill[]>(`/accounts-payable/bills/by-vendor/${vendorId}`, { params });
  }

  /**
   * Creates a new bill
   */
  async createBill(data: CreateBillDto): Promise<Bill> {
    return this.post<Bill>('/accounts-payable/bills', data);
  }

  /**
   * Updates an existing bill
   */
  async updateBill(id: string | number, data: UpdateBillDto): Promise<Bill> {
    return this.patch<Bill>(`/accounts-payable/bills/${id}`, data);
  }

  /**
   * Deletes a bill
   */
  async deleteBill(id: string | number): Promise<void> {
    return this.delete(`/accounts-payable/bills/${id}`);
  }

  /**
   * Approves a bill
   */
  async approveBill(id: string | number): Promise<Bill> {
    return this.patch<Bill>(`/accounts-payable/bills/${id}/approve`, {});
  }

  /**
   * Voids a bill
   */
  async voidBill(id: string | number): Promise<Bill> {
    return this.patch<Bill>(`/accounts-payable/bills/${id}/void`, {});
  }
}
