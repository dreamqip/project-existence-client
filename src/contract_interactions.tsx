import { ethers, Transaction } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { DataHexString } from 'ethers/types/utils/data';
import { AddressLike } from 'ethers/types/address';

const ORGANISATION_FACTORY_ABI = [
    "function deployOrganisation (string calldata _organisationMetadata, address _organisationOwner) public",
    "function setFees (uint _organisationDeploymentFee, uint _registerDeploymentFee, uint _recordDeploymentFee) public",
    "event OrganisationDeployed (address organisation, address organisationOwner);",
    "event FeesUpdated(uint organisationDeploymentFee, uint registerDeploymentFee, uint recordCreationFee);",
    "mapping (address => bool) public organisations",
];
const ORGANISATION_ABI = [
    "function deployRegister (string calldata _registerMetadata) public",
    "function updateOrganisationMetadata (string calldata _metadata) public",
    "event RegisterDeployed (address register)",
    "event OrganisationMetadataUpdated (address organisation, string metadata)",
    "address[] public registers",
];
const REGISTER_ABI = [
    "function createRecord (bytes32 _documentHash, string calldata _sourceDocument, string calldata _referenceDocument, uint256 _startsAt, uint256 _expiresAt, bytes32 _pastDocumentHash) public ",
    "function invalidateRecord (bytes32 _documentHash) public",
    "function editRegisterMetadata (string calldata _metadata) public ",
    "event RecordCreated (bytes32 documentHash)",
    "event RecordUpdated (bytes32 documentHash)",
    "event RecordInvalidated (bytes32 documentHash)",
    "event RegisterMetadataEdited (address register, string metadata)",
    "address public organisation",
];

// For values that have a simple meaning in JavaScript, the types are fairly straightforward; strings and booleans are returned as JavaScript strings and booleans.
// For numbers, if the type is in the JavaScript safe range (i.e. less than 53 bits, such as an int24 or uint48) a normal JavaScript number is used. Otherwise a BigNumber is returned.
// For bytes (both fixed length and dynamic), a DataHexString is returned.
// address is AddressLike (string or Addressable)
type OrganisationFactoryContract = ethers.Contract & {
    deployOrganisation: (metadata: string, owner: AddressLike) => Promise<Transaction>;
    setFees: (orgDeploymentFee: BigInt, registerDeploymentFee: BigInt, recordDeploymentFee: BigInt) => Promise<Transaction>;
    organisations: (address: AddressLike) => Promise<boolean>
}
type OrganisationContract = ethers.Contract & {
    updateOrganisationMetadata: (metadata: string) => Promise<Transaction>;
    deployRegister: (metadata: string) => Promise<Transaction>;
    registers: (id: number) => Promise<AddressLike>;
}
type RegisterContract = ethers.Contract & {
    createRecord: (documentHash: DataHexString, sourceDocument: string, referenceDocument: string, startsAt: BigInt, expiresAt: BigInt, pastDocumentHash: DataHexString) => Promise<Transaction>;
    invalidateRecord: (documentHash: DataHexString) => Promise<Transaction>;
    editRegisterMetadata: (metadata: string) => Promise<Transaction>;
    organisation: () => Promise<AddressLike>;
}

let provider: ethers.BrowserProvider | null = null; // null if updateProvider was not called or updateProvider didn't found the provider
export async function updateProvider(chain: "mainnet" | "testnet" | "fakenet") {
    let chainID = 0xfa;
    if(chain === "testnet") chainID = 0xfa2;
    if(chain === "fakenet") chainID = 0xfa3;
    let rawProvider = await detectEthereumProvider();
    provider = rawProvider == null ? null : new ethers.BrowserProvider(rawProvider as any, chainID);
    return provider != null;
}
export function getProvider() {
    return provider;
}

// if orgFactory has not been passed, then dont check if contract is official
export async function searchForOrganisationOrRegister(address: string, orgFactory?: OrganisationFactoryContract): Promise<OrganisationContract | RegisterContract | null> { 
    if(provider === null) throw new NoProviderError();

    let possibleOrganisation = await getOrganisationContract(address);
    if(possibleOrganisation != null) { // it is an organisation (possibly, fake)
        if(orgFactory && !(await orgFactory.organisations(address))){
            return null; // organisation is not official
        }
        return possibleOrganisation;
    }
    
    let possibleRegister = await getRegisterContract(address);
    if(possibleRegister != null) { // it is a register (possibly, fake)
        if(orgFactory){
            let orgAddress = (await possibleRegister.organisation()).toString();
            let org = await getOrganisationContract(orgAddress);
            if(org == null) return null; // such organisation doesnt exist
            if(!(await orgFactory.organisations(orgAddress))) return null; // organisation of the register is not official
            for(var i = 0;; i++){
                try{
                    let registerAddress = (await org.registers(i)).toString();
                    if(registerAddress == address) break; // register found in the org
                } catch {
                    return null;  // register is not in the organisation
                }
            }
        }
        return possibleRegister;
    }

    return null;
}

export async function getOrganisationFactoryContract (contractAddress: string, skipCheck?:boolean) {
    if(provider === null) throw new NoProviderError();
    if(!skipCheck){
        const bytecode = await provider.getCode(contractAddress);
        if (!bytecode.includes(ethers.keccak256(ethers.toUtf8Bytes("deployOrganisation(string,address)")).slice(2, 10))) {
            // No function: no function selector in bytecode
            return null;
        }
    }
    return new ethers.Contract(contractAddress, ORGANISATION_FACTORY_ABI, provider) as OrganisationFactoryContract;
}

export async function getOrganisationContract (contractAddress: string, skipCheck?:boolean) {
    if(provider === null) throw new NoProviderError();
    if(!skipCheck){
        const bytecode = await provider.getCode(contractAddress);
        if (!bytecode.includes(ethers.keccak256(ethers.toUtf8Bytes("updateOrganisationMetadata(string)")).slice(2, 10))) {
            // No function: no function selector in bytecode
            return null;
        }
    }
   return new ethers.Contract(contractAddress, ORGANISATION_ABI, provider) as OrganisationContract;
}

export async function getRegisterContract (contractAddress: string, skipCheck?:boolean) {
    if(provider === null) throw new NoProviderError();
    if(!skipCheck){
        const bytecode = await provider.getCode(contractAddress);
        if (!bytecode.includes(ethers.keccak256(ethers.toUtf8Bytes("editRegisterMetadata(string)")).slice(2, 10))) {
            // No function: no function selector in bytecode
            return null;
        }
    }
    return new ethers.Contract(contractAddress, REGISTER_ABI, provider) as RegisterContract;
}

export class NoProviderError extends Error {
    constructor() {
        super("provider is null");
        Object.setPrototypeOf(this, NoProviderError.prototype);
    }
}
