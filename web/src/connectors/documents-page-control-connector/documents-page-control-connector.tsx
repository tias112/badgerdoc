// temporary_disabled_rules
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-redeclare, react-hooks/exhaustive-deps */
import React, { useCallback, useState, useContext, useEffect } from 'react';
import {
    Button,
    FlexRow,
    FlexCell,
    FlexSpacer,
    SearchInput,
    PickerInput,
    Text,
    MultiSwitch,
    UploadFileToggler
} from '@epam/loveship';
import { useHistory } from 'react-router-dom';
import { useArrayDataSource } from '@epam/uui';
import { getError } from 'shared/helpers/get-error';
import styles from './documents-page-control-connector.module.scss';
import { DocumentsFilterCardIcon } from './documents-filter-card-icon';
import { DocumentsFilterListIcon } from './documents-filter-list-icon';
import { BreadcrumbNavigation } from 'shared/components/breadcrumb';
import { DocumentsSearch } from 'shared/contexts/documents-search';
import { ReactComponent as WizardIcon } from 'icons/wizard.svg';
import { useNotifications } from '../../shared/components/notifications';
import { useUploadFilesMutationWithProgressTracking } from '../../api/hooks/documents';
import { UploadIndicator } from 'components/upload-indicator/upload-indicator';
import { useFetchWithTrackingOfUploadProgress } from './use-fetch-with-tracking-of-upload-progress';
import { DocumentView } from 'api/typings';
type DocumentsPageControlProps = {
    isSearchPage?: boolean;
    isSearchPiecesPage?: boolean;
    handleUploadWizardButtonClick: () => void;
    onSearchClick: () => void;
};

const sortPiecesItems = [
    { id: 'relevancy', name: 'Relevancy' },
    { id: 'category', name: 'Category' }
];

const sortFilesItems = [
    { id: 'last_modified', name: 'Last Modified' },
    { id: 'original_name', name: 'Name' }
];

const searchMethodItems = [
    { id: 'text', name: 'Text Match' },
    { id: 'semantic', name: 'Semantic Search' },
    { id: 'qa', name: 'Q&A' }
];

const whereItems = [
    { id: 'document', name: 'in  documents' },
    { id: 'file', name: 'in file names' },
    { id: 'annotation', name: 'in annotation' }
];

export const DocumentsPageControlConnector = ({
    isSearchPage,
    isSearchPiecesPage,
    handleUploadWizardButtonClick
}: DocumentsPageControlProps) => {
    const history = useHistory();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const uploadProgressTracker = useFetchWithTrackingOfUploadProgress({
        onError: () => setIsLoading(false)
    });
    const uploadFilesMutation = useUploadFilesMutationWithProgressTracking({
        customFetch: uploadProgressTracker.fetchWithTrackingOfUploadProgress
    });
    const dataSortSource = useArrayDataSource(
        {
            items: isSearchPage || isSearchPiecesPage ? sortPiecesItems : sortFilesItems
        },
        [isSearchPage]
    );

    const searchMethodSource = useArrayDataSource(
        {
            items: searchMethodItems
        },
        [isSearchPage]
    );

    const whereSource = useArrayDataSource(
        {
            items: whereItems
        },
        [isSearchPage] //TODO
    );

    const { notifyError, notifySuccess } = useNotifications();

    const {
        query,
        documentView,
        breadcrumbs,
        documentsSort,
        method,
        where,
        setQuery,
        setDocumentView,
        setDocumentsSort,
        setMethod,
        setWhere
    } = useContext(DocumentsSearch);

    const isCard = documentView === 'card';
    const isTable = documentView === 'table';

    const handleAddFiles = useCallback(async (files: File[]) => {
        if (!files?.length) return;

        try {
            setIsLoading(true);
            const responses = await uploadFilesMutation.mutateAsync([...files]);

            for (const response of responses) {
                notifySuccess(<Text>{response.message}</Text>);
            }
        } catch (error) {
            notifyError(<Text>{getError(error)}</Text>);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <>
            <FlexRow alignItems="center" cx={styles['header-container']}>
                <BreadcrumbNavigation breadcrumbs={breadcrumbs} />
                <FlexRow spacing="12">
                    {isLoading ? (
                        <UploadIndicator uploadProgressTracker={uploadProgressTracker} />
                    ) : (
                        <FlexSpacer />
                    )}
                    <FlexRow>
                        <FlexRow padding="6">
                            <UploadFileToggler
                                onFilesAdded={handleAddFiles}
                                render={({ onClick }) => (
                                    <Button
                                        caption="Upload"
                                        isDisabled={isLoading}
                                        onClick={onClick}
                                    />
                                )}
                            />
                        </FlexRow>
                        <FlexRow padding="6">
                            <Button
                                caption="Upload Wizard"
                                onClick={handleUploadWizardButtonClick}
                                color="grass"
                                icon={WizardIcon}
                            />
                        </FlexRow>
                    </FlexRow>
                </FlexRow>
            </FlexRow>
            <FlexRow spacing="12">
                <FlexCell grow={5}>
                    <SearchInput
                        value={query}
                        onValueChange={(value) => setQuery(value || '')}
                        placeholder={`Search in ${isSearchPage ? 'documents' : 'files'}`}
                        debounceDelay={1500}
                    />
                </FlexCell>
                {isCard && (
                    <FlexRow cx={styles['search-filter']}>
                        <span className={styles['sort-name']}>Scope:</span>
                        <PickerInput
                            minBodyWidth={20}
                            //value={(where=='document') ? 'document' : (isSearchPage ? 'annotation'  : 'file')}
                            value={where}
                            // value={where}
                            dataSource={whereSource}
                            onValueChange={(newValue) => {
                                //setWhere(newValue);

                                switch (newValue) {
                                    case 'document':
                                        history.push('/documents/search');
                                        setWhere(newValue);
                                        break;
                                    case 'annotation':
                                        history.push('/documents/search');
                                        setWhere(newValue);
                                        break;
                                    case 'file':
                                        history.push('/documents');
                                        setWhere(newValue);
                                        break;
                                    default:
                                        history.push('/documents');
                                }
                            }}
                            getName={(item: any) => item.name}
                            disableClear
                            selectionMode="single"
                            valueType={'id'}
                        />
                    </FlexRow>
                )}

                {isCard && (
                    <FlexRow cx={styles['search-filter']}>
                        <span className={styles['sort-name']}>How:</span>
                        <PickerInput
                            minBodyWidth={40}
                            dataSource={searchMethodSource}
                            value={method}
                            onValueChange={setMethod}
                            getName={(item: any) => item.name}
                            disableClear
                            selectionMode="single"
                            valueType={'id'}
                        />
                    </FlexRow>
                )}
                {isCard && (
                    <FlexRow cx={styles['search-filter']}>
                        <span className={styles['sort-name']}>Sort by:</span>
                        <PickerInput
                            minBodyWidth={40}
                            dataSource={dataSortSource}
                            value={documentsSort}
                            onValueChange={setDocumentsSort}
                            getName={(item: any) => item.name}
                            disableClear
                            selectionMode="single"
                            valueType={'id'}
                        />
                    </FlexRow>
                )}
                <FlexRow>
                    <DocumentsFilterCardIcon
                        isDisable={!!isSearchPage}
                        onDocViewChange={setDocumentView}
                        isActive={isCard}
                    />
                    <DocumentsFilterListIcon
                        isDisable={!!isSearchPage}
                        onDocViewChange={setDocumentView}
                        isActive={isTable}
                    />
                </FlexRow>
            </FlexRow>
        </>
    );
};
