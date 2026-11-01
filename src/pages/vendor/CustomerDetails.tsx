import CustomerDetailsView from '../shared/CustomerDetailsView';

export default function VendorCustomerDetails() {
  return <CustomerDetailsView basePath="/vendor" canRegisterDevices={false} />;
}
