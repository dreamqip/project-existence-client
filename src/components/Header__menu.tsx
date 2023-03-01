import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/Header.module.scss';
import { Button, TextInput, Modal, Stack } from '@mantine/core';
import {
  TextCaption,
  BrandMailgun,
  TextColor,
  Hash,
  ExternalLink,
  FileSymlink,
  FileTime,
} from 'tabler-icons-react';
import { serializeMetadata } from '@/utils';
import { getOrganisationFactoryContract, getProvider, getSigner } from '@/contract_interactions';
import { ORGANISATION_FACTORY_ADDRESS } from '@/config';

export default function Header__menu({
  walletConnected,
}: {
  walletConnected: boolean;
}) {
  const router = useRouter();
  const isHomePage = router.pathname === '/';
  const isOrganisationsPage = router.pathname === '/organisations';
  const isOrganisationPage = /\/organisations\/.+/.test(router.pathname);
  const isRegisterPage = /\/organisations\/.+\/.+/.test(router.pathname);
  const [orgModalOpened, setOrgModalOpened] = useState(false);
  const [regModalOpened, setRegModalOpened] = useState(false);
  const [createRecModalOpened, setCreateRecModalOpened] = useState(false);
  const [invaliRecModalOpened, setInvaliRecModalOpened] = useState(false);

  const [orgFormInput, setOrgFormInput] = useState({ name: "", description: "", contacts: "" });
  const [createOrganisationButtonContent, setCreateOrganisationButtonContent] = useState([<>Create Organisation</>, true] as [JSX.Element, boolean]);
  const [updateOrganisationButtonContent, setUpdateOrganisationButtonContent] = useState([<>Update Organisation</>, true] as [JSX.Element, boolean]);

  return (
    <div>
      {isHomePage ? null : null}
      {isOrganisationsPage ? (
        <div className={styles.header__menu}>
          <Button radius='md' onClick={() => {
            setOrgModalOpened(true);
            setOrgFormInput({ name: "", description: "", contacts: "" });
            setCreateOrganisationButtonContent([<>Update Organisation</>, true]);
          }}>
            Create Organisation
          </Button>
          <Modal
            opened={orgModalOpened}
            onClose={() => setOrgModalOpened(false)}
            title='To create Organisation fill in the forms please.'
          >
            <Stack>
              <TextInput
                icon={<TextColor />}
                placeholder='Organisation name'
                onChange={(event) => setOrgFormInput({ ...orgFormInput, name: event.currentTarget.value })}
              />
              <TextInput
                icon={<TextCaption />}
                placeholder='Organisation description'
                onChange={(event) => setOrgFormInput({ ...orgFormInput, description: event.currentTarget.value })}
              />
              <TextInput
                icon={<BrandMailgun />}
                placeholder='Organisation contacts'
                onChange={(event) => setOrgFormInput({ ...orgFormInput, contacts: event.currentTarget.value })}
              />
              <Button radius='md' color='red' disabled={
                !createOrganisationButtonContent[1] || orgFormInput.name == "" || orgFormInput.description == "" || orgFormInput.contacts == ""
              } onClick={
                async (e) => {
                  setCreateOrganisationButtonContent([<>loading...</>, false]);

                  let signer = getSigner();
                  if (signer == null) {
                    setCreateOrganisationButtonContent([<>please connect your wallet</>, false]);
                    return;
                  }
                  let orgFactory = await getOrganisationFactoryContract(ORGANISATION_FACTORY_ADDRESS)
                  if (orgFactory == null) {
                    setCreateOrganisationButtonContent([<>error</>, false]);
                    return;
                  }

                  let rawMetadata = serializeMetadata(orgFormInput);
                  let tx = await orgFactory.deployOrganisation(rawMetadata, await signer.getAddress());
                  if (tx.hash == null) return;
                  await getProvider()?.waitForTransaction(tx.hash);
                  setCreateOrganisationButtonContent([<>Organisation created ✅</>, false]);
                }
              }>
                {createOrganisationButtonContent[0]}
              </Button>
            </Stack>
          </Modal>
        </div>
      ) : null}
      {isOrganisationPage && !isRegisterPage && walletConnected ? (
        <div className={styles.header__menu}>
          <Button radius='md' onClick={() => {
            setOrgModalOpened(true);
            setOrgFormInput({ name: "", description: "", contacts: "" });
            setUpdateOrganisationButtonContent([<>Update Organisation</>, true]);
          }}>
            Update Organisation
          </Button>
          <Modal
            opened={orgModalOpened}
            onClose={() => setOrgModalOpened(false)}
            title='Fill in the forms you want to update.'
          >
            <Stack>
              <TextInput
                icon={<TextColor />}
                placeholder='Organisation name'
                onChange={(event) => setOrgFormInput({ ...orgFormInput, name: event.currentTarget.value })}
              />
              <TextInput
                icon={<TextCaption />}
                placeholder='Organisation description'
                onChange={(event) => setOrgFormInput({ ...orgFormInput, description: event.currentTarget.value })}
              />
              <TextInput
                icon={<BrandMailgun />}
                placeholder='Organisation contacts'
                onChange={(event) => setOrgFormInput({ ...orgFormInput, contacts: event.currentTarget.value })}
              />
              <Button radius='md' color='red' disabled={
                !updateOrganisationButtonContent[1] || orgFormInput.name == "" || orgFormInput.description == "" || orgFormInput.contacts == ""
              } onClick={
                async (e) => {
                  setUpdateOrganisationButtonContent([<>loading...</>, false]);

                  let signer = getSigner();
                  if (signer == null) {
                    setUpdateOrganisationButtonContent([<>please connect your wallet</>, false]);
                    return;
                  }
                  /*let orgFactory = await getOrganisationFactoryContract(ORGANISATION_FACTORY_ADDRESS)
                  if (orgFactory == null) {
                    setCreateOrganisationButtonContent([<>error</>, false]);
                    return;
                  }

                  let rawMetadata = serializeMetadata(orgFormInput);
                  let tx = await orgFactory.deployOrganisation(rawMetadata, await signer.getAddress());
                  if (tx.hash == null) return;
                  await getProvider()?.waitForTransaction(tx.hash);*/
                  setUpdateOrganisationButtonContent([<>Organisation edited TODO ✅</>, false]);
                }
              } >
                {updateOrganisationButtonContent}
              </Button>
            </Stack>
          </Modal>
          <Button radius='md' onClick={() => setRegModalOpened(true)}>
            Deploy Register
          </Button>
          <Modal
            opened={regModalOpened}
            onClose={() => setRegModalOpened(false)}
            title='To create Register fill in the forms'
          >
            <Stack>
              <TextInput icon={<TextColor />} placeholder='Register name' />
              <TextInput
                icon={<TextCaption />}
                placeholder='Register description'
              />
              <TextInput icon={<BrandMailgun />} placeholder='Register contacts' />
              <Button radius='md' color='red'>
                Deploy Register
              </Button>
            </Stack>
          </Modal>
        </div>
      ) : null}
      {isRegisterPage && walletConnected ? (
        <div className={styles.header__menu}>
          <Button radius='md' onClick={() => setCreateRecModalOpened(true)}>
            Create Record
          </Button>
          <Modal
            opened={createRecModalOpened}
            onClose={() => setCreateRecModalOpened(false)}
            title='To create Record fill in the forms'
          >
            <Stack>
              <TextInput icon={<Hash />} placeholder='Document hash' />
              <TextInput icon={<FileSymlink />} placeholder='Source Document' />
              <TextInput icon={<ExternalLink />} placeholder='Reference Document' />
              <TextInput icon={<FileTime />} placeholder='Starts at' />
              <TextInput icon={<FileTime />} placeholder='Expires at' />
              <TextInput icon={<Hash />} placeholder='Past Document Hash' />
              <Button radius='md' color='red'>
                Create Record
              </Button>
            </Stack>
          </Modal>
          <Button radius='md' onClick={() => setInvaliRecModalOpened(true)}>
            Invalidate Record
          </Button>
          <Modal
            opened={invaliRecModalOpened}
            onClose={() => setInvaliRecModalOpened(false)}
            title='To invalidate Record fill in the forms'
          >
            <Stack>
              <TextInput icon={<Hash />} placeholder='Document hash' />
              <Button radius='md' color='red'>
                Invalidate Record
              </Button>
            </Stack>
          </Modal>
          <Button radius='md' onClick={() => setRegModalOpened(true)}>
            Update Register
          </Button>
          <Modal
            opened={regModalOpened}
            onClose={() => setRegModalOpened(false)}
            title='Fill in the forms you want to update.'
          >
            <Stack>
              <TextInput icon={<TextColor />} placeholder='Register name' />
              <TextInput
                icon={<TextCaption />}
                placeholder='Register description'
              />
              <TextInput icon={<BrandMailgun />} placeholder='Register contacts' />
              <Button radius='md' color='red'>
                Update Register
              </Button>
            </Stack>
          </Modal>
        </div>
      ) : null}
    </div>
  );
}
