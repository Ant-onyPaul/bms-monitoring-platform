import CustomerDetailsView from '../shared/CustomerDetailsView';

export default function AdminCustomerDetails() {
  return <CustomerDetailsView basePath="/admin" canRegisterDevices />;
}
