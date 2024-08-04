import { Form, Formik, FormikHelpers } from 'formik';
import { useState } from 'react';
import { object, string } from 'yup';

import FlashMessageRender from '@/components/FlashMessageRender';
import Field from '@/components/elements/Field';
import Modal from '@/components/elements/Modal';
import { Button } from '@/components/elements/button/index';

import { httpErrorToHuman } from '@/api/http';
import createServerDatabase from '@/api/server/databases/createServerDatabase';

import { ServerContext } from '@/state/server';

import useFlash from '@/plugins/useFlash';

interface Values {
    databaseName: string;
    connectionsFrom: string;
}

const schema = object().shape({
    databaseName: string()
        .required('A database name must be provided.')
        .min(3, 'Database name must be at least 3 characters.')
        .max(48, 'Database name must not exceed 48 characters.')
        .matches(
            /^[\w\-.]{3,48}$/,
            'Database name should only contain alphanumeric characters, underscores, dashes, and/or periods.',
        ),
    connectionsFrom: string().matches(/^[\w\-/.%:]+$/, 'A valid host address must be provided.'),
});

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const [visible, setVisible] = useState(false);

    const appendDatabase = ServerContext.useStoreActions((actions) => actions.databases.appendDatabase);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('database:create');
        createServerDatabase(uuid, {
            databaseName: values.databaseName,
            connectionsFrom: values.connectionsFrom || '%',
        })
            .then((database) => {
                appendDatabase(database);
                setVisible(false);
            })
            .catch((error) => {
                addError({ key: 'database:create', message: httpErrorToHuman(error) });
                setSubmitting(false);
            });
    };

    return (
        <>
            <Formik
                onSubmit={submit}
                initialValues={{ databaseName: '', connectionsFrom: '' }}
                validationSchema={schema}
            >
                {({ isSubmitting, resetForm }) => (
                    <Modal
                        visible={visible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            resetForm();
                            setVisible(false);
                        }}
                    >
                        <div className='flex flex-col'>
                            <FlashMessageRender byKey={'database:create'} />
                            <h2 className={`text-2xl mb-6`}>Create new database</h2>
                            <Form className={`m-0 flex flex-col`}>
                                <Field
                                    type={'string'}
                                    id={'database_name'}
                                    name={'databaseName'}
                                    label={'Database Name'}
                                    description={'A descriptive name for your database instance.'}
                                />
                                <div className={`mt-6`}>
                                    <Field
                                        type={'string'}
                                        id={'connections_from'}
                                        name={'connectionsFrom'}
                                        label={'Connections From'}
                                        description={
                                            'Where connections should be allowed from. Leave blank to allow connections from anywhere.'
                                        }
                                    />
                                </div>
                                <div className={`flex gap-6 justify-end my-6`}>
                                    <Button type={'button'} onClick={() => setVisible(false)}>
                                        Cancel
                                    </Button>
                                    <Button type={'submit'}>Create Database</Button>
                                </div>
                            </Form>
                        </div>
                    </Modal>
                )}
            </Formik>
            <div className='flex gap-4'>
                <button
                    style={{
                        background:
                            'radial-gradient(124.75% 124.75% at 50.01% -10.55%, rgb(36, 36, 36) 0%, rgb(20, 20, 20) 100%)',
                    }}
                    className='px-8 py-3 border-[1px] border-[#ffffff12] rounded-full text-sm font-bold shadow-md'
                    onClick={() => setVisible(true)}
                >
                    New Database
                </button>
                <button
                    style={{
                        background:
                            'radial-gradient(124.75% 124.75% at 50.01% -10.55%, rgb(36, 36, 36) 0%, rgb(20, 20, 20) 100%)',
                    }}
                    className='px-8 py-3 border-[1px] border-[#ffffff12] rounded-full text-sm font-bold shadow-md'
                    onClick={() => window.open('https://pma.softcore.pro', '_blank')}
                >
                    Open PMA
                </button>
            </div>
        </>
    );
};
