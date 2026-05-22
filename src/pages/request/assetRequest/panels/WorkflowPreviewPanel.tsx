/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { Control, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import RoutesUtills from '../../../../core/routes/utills';
import WorkflowPreview from '../../../approvalWorkflows/WorkflowPreview';
import { IResolvedApprovalWorkflow } from '../../../approvalWorkflows/interface';
import { resolveApprovalWorkflowService } from '../../../approvalWorkflows/service';
import { IRequest } from '../../interface';
import { PageSection } from '../../../../components/layout';

interface IWorkflowPreviewPanelProps {
    control: Control<IRequest>;
}

const WorkflowPreviewPanel = ({ control }: IWorkflowPreviewPanelProps) => {
    const { getCurrentUser } = RoutesUtills();
    const currentUser = getCurrentUser();
    const requesterId = currentUser?.id ?? null;
    const branchId = currentUser?.branch?.id ?? null;

    const selectedCategoryId = useWatch({ control, name: 'assetTypeId' });

    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const categoryName =
        assetTypes.find((at) => String(at.id) === String(selectedCategoryId))?.name ?? null;
    const branchName = currentUser?.branch?.name ?? 'your branch';
    const requesterLabel = currentUser?.firstName
        ? `${currentUser.firstName} ${currentUser.lastName ?? ''}`.trim()
        : 'you';

    const [resolved, setResolved] = useState<IResolvedApprovalWorkflow | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedCategoryId) {
            setResolved(null);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        resolveApprovalWorkflowService({
            categoryId: selectedCategoryId as string | number,
            branchId,
            requesterId,
        })
            .then((response) => {
                if (cancelled) return;
                setResolved(response.data as IResolvedApprovalWorkflow);
            })
            .catch((err: any) => {
                if (cancelled) return;
                const message =
                    err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    'Unable to preview the approval flow right now.';
                setError(message);
                setResolved(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [selectedCategoryId, branchId, requesterId]);

    if (!selectedCategoryId) return null;

    return (
        <PageSection
            title="Approval Flow Preview"
            subtitle="Here's who will approve this request, based on your role and branch."
            icon={<AccountTreeOutlinedIcon />}
        >
            {!requesterId && (
                <Box sx={{ mb: 1.5 }}>
                    <Alert severity="info" variant="outlined">
                        Sign in to see your personal approval chain. The preview below uses defaults.
                    </Alert>
                </Box>
            )}
            <WorkflowPreview
                resolved={resolved}
                loading={loading}
                error={error}
                caption={
                    categoryName
                        ? `Preview for: ${categoryName} · ${branchName} · ${requesterLabel}`
                        : undefined
                }
            />
        </PageSection>
    );
};

export default WorkflowPreviewPanel;
