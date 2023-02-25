import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

const ORGANISATION_FACTORY_ABI = [
    "function deployOrganisation (string calldata _organisationMetadata, address _organisationOwner) public",
    "function setFees (uint _organisationDeploymentFee, uint _registerDeploymentFee, uint _recordDeploymentFee) public",
    "event OrganisationDeployed (address organisation, address organisationOwner);",
    "event FeesUpdated(uint organisationDeploymentFee, uint registerDeploymentFee, uint recordCreationFee);",
];
const ORGANISATION_ABI = [
    "function deployRegister (string calldata _registerMetadata) public",
    "function updateOrganisationMetadata (string calldata _metadata) public",
    "event RegisterDeployed (address register)",
    "event OrganisationMetadataUpdated (address organisation, string metadata)",
];
const REGISTER_ABI = [
    "function createRecord (bytes32 _documentHash, string calldata _sourceDocument, string calldata _referenceDocument, uint256 _startsAt, uint256 _expiresAt, bytes32 _pastDocumentHash) public ",
    "function invalidateRecord (bytes32 _documentHash) public",
    "function editRegisterMetadata (string calldata _metadata) public ",
    "event RecordCreated (bytes32 documentHash)",
    "event RecordUpdated (bytes32 documentHash)",
    "event RecordInvalidated (bytes32 documentHash)",
    "event RegisterMetadataEdited (address register, string metadata)",
];

type OrganisationFactoryContract = ethers.Contract & {
    deployOrganisation: (metadata: string, owner: string) => {};
    setFees: (orgDeploymentFee: string, registerDeploymentFee: string, recordDeploymentFee: string) => {};
}
type OrganisationContract = ethers.Contract & {
    updateOrganisationMetadata: (metadata: string) => {};
    deployRegister: (metadata: string) => {};
}
type RegisterContract = ethers.Contract & {
    createRecord: (metadata: string) => {};
    setFees: (orgDeploymentFee: number) => {};
}

let provider: ethers.BrowserProvider | null = null; // null if updateProvider was not called or updateProvider didn't found the provider
async function updateProvider(chain: "mainnet" | "testnet" | "fakenet") {
    let chainID = 0xfa;
    if(chain === "testnet") chainID = 0xfa2;
    if(chain === "fakenet") chainID = 0xfa3;
    let rawProvider = await detectEthereumProvider();
    provider = rawProvider == null ? null : new ethers.BrowserProvider(rawProvider as any, chainID);
    return provider != null;
}

function getOrganisationFactoryContract (contract_address: string) {
    if(provider === null) throw new NoProviderError();
    return new ethers.Contract(contract_address, ORGANISATION_FACTORY_ABI, provider) as OrganisationFactoryContract;
}

function getOrganisationContract (contract_address: string) {
    if(provider === null) throw new NoProviderError();
    return new ethers.Contract(contract_address, ORGANISATION_ABI, provider) as OrganisationContract;
}

function getRegisterContract (contract_address: string) {
    if(provider === null) throw new NoProviderError();
    return new ethers.Contract(contract_address, REGISTER_ABI, provider) as RegisterContract;
}

class NoProviderError extends Error {
    constructor() {
        super("provider is null");
        Object.setPrototypeOf(this, NoProviderError.prototype);
    }
}

export {provider, updateProvider, getOrganisationContract, getRegisterContract, getOrganisationFactoryContract};