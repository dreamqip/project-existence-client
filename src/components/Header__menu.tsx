import React, { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/Header.module.scss';
import { Button, TextInput, Modal, Stack, LoadingOverlay } from '@mantine/core';
import {
  TextCaption,
  BrandMailgun,
  TextColor,
  Hash,
  ExternalLink,
  FileSymlink,
  FileTime,
} from 'tabler-icons-react';
import CreateOrganisationForm from './forms/CreateOrganisationForm';
import UpdateOrganisationForm from './forms/UpdateOrganisationForm';
import {update as updateOrganisationPage} from '@/pages/organisations/[id]';
import {update as updateRegisterPage} from '@/pages/organisations/[id]/[regAddr]';
import DeployRegisterForm from './forms/DeployRegisterForm';
import CreateRecordForm from './forms/CreateRecordForm';
import UpdateRegisterForm from './forms/UpdateRegisterForm';
import InvalidateRecordForm from './forms/InvalidateRecordForm';

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

  const orgAddress = isOrganisationPage ? router.query.id ? typeof router.query.id == "string" ? router.query.id : router.query.id[0] : null : null;
  const regAddress = isRegisterPage ? router.query.regAddr ? typeof router.query.regAddr == "string" ? router.query.regAddr : router.query.regAddr[0] : null : null;

  return (
    <div>
      {isHomePage ? null : null}
      {isOrganisationsPage && walletConnected ? (
        <div className={styles.header__menu}>
          <Button
            radius='md'
            onClick={() => {
              setOrgModalOpened(true);
            }}
          >
            Create Organisation
          </Button>
          <Modal
            opened={orgModalOpened}
            onClose={() => setOrgModalOpened(false)}
            title='To create Organisation fill in the forms please.'
          >
            <CreateOrganisationForm update={() => setOrgModalOpened(false)} />
          </Modal>
        </div>
      ) : null}
      {isOrganisationPage && orgAddress && !isRegisterPage && walletConnected ? (
        <div className={styles.header__menu}>
          <Button
            radius='md'
            onClick={() => {
              setOrgModalOpened(true);
            }}
          >
            Update Organisation
          </Button>
          <Modal
            opened={orgModalOpened}
            onClose={() => setOrgModalOpened(false)}
            title='Fill in the forms you want to update.'
          >
            <UpdateOrganisationForm orgAddress={orgAddress} update={() => updateOrganisationPage()} updateModal={() => setOrgModalOpened(false)}/>
          </Modal>
          <Button radius='md' onClick={() => setRegModalOpened(true)}>
            Deploy Register
          </Button>
          <Modal
            opened={regModalOpened}
            onClose={() => setRegModalOpened(false)}
            title='To create Register fill in the forms'
          >
            <DeployRegisterForm orgAddress={orgAddress} update={() => updateOrganisationPage()} updateModal={() => setRegModalOpened(false)} />
          </Modal>
        </div>
      ) : null}
      {isRegisterPage && walletConnected ? (
        <div className={styles.header__menu}>
          <Button radius='md' onClick={() => setCreateRecModalOpened(true)}>
            Create Record
          </Button>
          <Modal size="lg"
            opened={createRecModalOpened}
            onClose={() => setCreateRecModalOpened(false)}
            title='To create Record fill in the forms'
          >
            <CreateRecordForm updateModal={() => setCreateRecModalOpened(false)} update={() => updateRegisterPage()} registerAddress={regAddress ?? ""}/>
          </Modal>
          <Button radius='md' onClick={() => setInvaliRecModalOpened(true)}>
            Invalidate Record
          </Button>
          <Modal
            opened={invaliRecModalOpened}
            onClose={() => setInvaliRecModalOpened(false)}
            title='To invalidate Record fill in the forms'
          >
            <InvalidateRecordForm updateModal={() => setInvaliRecModalOpened(false)} update={() => updateRegisterPage()} registerAddress={regAddress ?? ''} />
          </Modal>
          <Button radius='md' onClick={() => setRegModalOpened(true)}>
            Update Register
          </Button>
          <Modal
            opened={regModalOpened}
            onClose={() => setRegModalOpened(false)}
            title='Fill in the forms you want to update.'
          >
            <UpdateRegisterForm update={() => updateRegisterPage()} regAddress={regAddress ?? ""} updateModal={() => setRegModalOpened(false)} />
          </Modal>
        </div>
      ) : null}
    </div>
  );
}
