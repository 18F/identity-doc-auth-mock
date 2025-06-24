const passport_pass = {
  referenceId: "myReferenceId12345",
  previousReferenceId: "myPreviousReferenceId67890",
  documentVerification: {
    reasonCodes: [],
    documentType: {
      type: "Passport",
      country: "USA",
      state: "USA"
    },
    decision: {
      name: "standard",
      value: "accept"
    },
    documentData: {
      firstName: "DWAYNE",
      surName: "DENVER",
      fullName: "DWAYNE DENVER",
      documentNumber: "E99999999",
      dob: "1965-02-05",
      expirationDate: "2030-07-09",
      customFields: {
        documentNumber: "E99999999"
      }
    },
    rawData: {
      mrz: "P<DENVER<<DWAYNE<<<<<<<<<<<<<<<<<<<<<<<<\n0123456789USA1234567F1234567890123456<123456"
    }
  }
};

const license_pass = {
  referenceId: "myReferenceId12345",
  previousReferenceId: "myPreviousReferenceId67890",
  documentVerification: {
    reasonCodes: [],
    documentType: {
      type: "Drivers License",
      country: "USA",
      state: "NY"
    },
    decision: {
      name: "lenient",
      value: "accept"
    },
    documentData: {
      firstName: "Dwayne",
      surName: "Denver",
      fullName: "Dwayne Denver",
      address: "123 Example Street, New York City, NY 10001",
      parsedAddress: {
        physicalAddress: "123 Example Street",
        physicalAddress2: "New York City NY 10001",
        city: "New York City",
        state: "NY",
        country: "US",
        zip: "10001"
      },
      documentNumber: "000000000",
      dob: "2002-01-01",
      issueDate: "2024-01-01",
      expirationDate: "2070-01-01"
    }
  },
  customerProfile: {
    customerUserId: "myCustomerUserID",
    userId: "myUserID"
  }
};

const randomDocumentPass = () =>{
  const documentTypes = [passport_pass, license_pass];
  // return at random
  return documentTypes[Math.floor(Math.random() * documentTypes.length)];
}

module.exports = {
  passport_pass,
  license_pass,
  randomDocumentPass,
};