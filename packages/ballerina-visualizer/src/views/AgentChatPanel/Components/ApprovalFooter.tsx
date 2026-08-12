/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState } from "react";
import styled from "@emotion/styled";
import { Icon, Button } from "@wso2/ui-toolkit";
import { ApprovalRequest, HumanResponse } from "@wso2/ballerina-core";

interface ApprovalFooterProps {
    requests: ApprovalRequest[];
    onSubmit: (decisions: Record<string, HumanResponse>) => Promise<void>;
}

const FooterBox = styled.div`
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
    overflow: hidden;
`;

const FooterHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--vscode-foreground);
`;

const WarnIconWrapper = styled.span`
    display: inline-flex;
    align-items: center;
    color: var(--vscode-editorWarning-foreground);
`;

const FooterDivider = styled.div`
    height: 1px;
    background: var(--vscode-panel-border);
    opacity: 0.7;
`;

const RequestRow = styled.div`
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const RequestTopLine = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
`;

const BatchIndex = styled.span`
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    flex-shrink: 0;
`;

const ToolName = styled.span`
    font-size: 12px;
    font-weight: 600;
    color: var(--vscode-foreground);
`;

const ArgsPreview = styled.code`
    font-family: var(--vscode-editor-font-family);
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 260px;
`;

const ToolDescription = styled.div`
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
`;

const RowActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
`;

const SmallButton = styled.button<{ variant: "allow" | "deny"; active?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid ${({ variant }: { variant: "allow" | "deny" }) =>
        variant === "allow" ? "var(--vscode-terminal-ansiGreen)" : "var(--vscode-errorForeground)"};
    color: ${({ variant }: { variant: "allow" | "deny" }) =>
        variant === "allow" ? "var(--vscode-terminal-ansiGreen)" : "var(--vscode-errorForeground)"};
    background: ${({ active, variant }: { active?: boolean; variant: "allow" | "deny" }) =>
        active
            ? variant === "allow"
                ? "color-mix(in srgb, var(--vscode-terminal-ansiGreen) 18%, transparent)"
                : "color-mix(in srgb, var(--vscode-errorForeground) 18%, transparent)"
            : "transparent"};

    &:hover:not(:disabled) {
        background-color: var(--vscode-list-hoverBackground);
    }

    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

const StagedBadge = styled.span<{ decision: "APPROVE" | "REJECT" }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: ${({ decision }: { decision: "APPROVE" | "REJECT" }) =>
        decision === "APPROVE" ? "var(--vscode-terminal-ansiGreen)" : "var(--vscode-errorForeground)"};
`;

const ChangeLink = styled.button`
    background: none;
    border: none;
    color: var(--vscode-textLink-foreground);
    font-size: 11px;
    cursor: pointer;
    padding: 0;
    margin-left: 6px;

    &:hover:not(:disabled) {
        text-decoration: underline;
    }

    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

const ReasonBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 4px;
`;

const ReasonInput = styled.textarea`
    width: 100%;
    min-height: 44px;
    resize: vertical;
    font-family: inherit;
    font-size: 12px;
    padding: 6px 8px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 4px;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: var(--vscode-button-background);
    }
`;

const ReasonActions = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
`;

const TextLinkButton = styled.button`
    background: none;
    border: none;
    color: var(--vscode-textLink-foreground);
    font-size: 12px;
    cursor: pointer;
    padding: 0;

    &:hover:not(:disabled) {
        text-decoration: underline;
    }

    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

const FooterBottom = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 12px;
`;

const HintText = styled.span`
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
`;

function formatArguments(args: Record<string, any>): string {
    try {
        return JSON.stringify(args);
    } catch {
        return String(args);
    }
}

export const ApprovalFooter: React.FC<ApprovalFooterProps> = ({ requests, onSubmit }) => {
    const [localDecisions, setLocalDecisions] = useState<Record<string, HumanResponse>>({});
    const [denyingId, setDenyingId] = useState<string | null>(null);
    const [reasonText, setReasonText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const allDecided = requests.every(r => !!localDecisions[r.id]);
    const decidedCount = requests.filter(r => !!localDecisions[r.id]).length;

    const stageApprove = (id: string) => {
        setLocalDecisions(prev => ({ ...prev, [id]: { decision: "APPROVE" } }));
        setDenyingId(null);
    };

    const startDeny = (id: string) => {
        setDenyingId(id);
        setReasonText("");
    };

    const confirmDeny = (id: string) => {
        const reason = reasonText.trim();
        setLocalDecisions(prev => ({ ...prev, [id]: { decision: "REJECT", ...(reason ? { reason } : {}) } }));
        setDenyingId(null);
        setReasonText("");
    };

    const changeDecision = (id: string) => {
        setLocalDecisions(prev => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await onSubmit(localDecisions);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <FooterBox>
            <FooterHeader>
                <WarnIconWrapper>
                    <Icon name="bi-shield-lock" sx={{ width: 14, height: 14 }} iconSx={{ fontSize: "14px" }} />
                </WarnIconWrapper>
                Agent paused &middot; {requests.length} tool call{requests.length > 1 ? "s" : ""} await approval
            </FooterHeader>
            <FooterDivider />
            {requests.map((req, idx) => {
                const staged = localDecisions[req.id];
                return (
                    <React.Fragment key={req.id}>
                        <RequestRow>
                            <RequestTopLine>
                                <BatchIndex>{idx + 1}/{requests.length}</BatchIndex>
                                <ToolName>{req.toolName}</ToolName>
                                <ArgsPreview title={formatArguments(req.arguments)}>{formatArguments(req.arguments)}</ArgsPreview>
                            </RequestTopLine>
                            <ToolDescription>{req.toolDescription}</ToolDescription>
                            {staged ? (
                                <div>
                                    <StagedBadge decision={staged.decision}>
                                        <Icon
                                            name={staged.decision === "APPROVE" ? "bi-check" : "bi-close"}
                                            sx={{ width: 14, height: 14 }}
                                            iconSx={{ fontSize: "14px" }}
                                        />
                                        {staged.decision === "APPROVE" ? "Allowed" : "Denied"}
                                        {staged.reason ? ` — "${staged.reason}"` : ""}
                                    </StagedBadge>
                                    <ChangeLink onClick={() => changeDecision(req.id)} disabled={submitting}>
                                        Change
                                    </ChangeLink>
                                </div>
                            ) : denyingId === req.id ? (
                                <ReasonBox>
                                    <ReasonInput
                                        autoFocus
                                        placeholder="Reason (optional), shown to the agent"
                                        value={reasonText}
                                        onChange={(e) => setReasonText(e.target.value)}
                                        disabled={submitting}
                                    />
                                    <ReasonActions>
                                        <TextLinkButton onClick={() => setDenyingId(null)} disabled={submitting}>
                                            Cancel
                                        </TextLinkButton>
                                        <SmallButton variant="deny" onClick={() => confirmDeny(req.id)} disabled={submitting}>
                                            Confirm Deny
                                        </SmallButton>
                                    </ReasonActions>
                                </ReasonBox>
                            ) : (
                                <RowActions>
                                    <SmallButton variant="allow" onClick={() => stageApprove(req.id)} disabled={submitting}>
                                        Allow
                                    </SmallButton>
                                    <SmallButton variant="deny" onClick={() => startDeny(req.id)} disabled={submitting}>
                                        Deny
                                    </SmallButton>
                                </RowActions>
                            )}
                        </RequestRow>
                        {idx < requests.length - 1 && <FooterDivider />}
                    </React.Fragment>
                );
            })}
            <FooterDivider />
            <FooterBottom>
                {!allDecided && (
                    <HintText>Decide on all {requests.length} requests to continue ({decidedCount}/{requests.length} done)</HintText>
                )}
                <Button appearance="primary" disabled={!allDecided || submitting} onClick={handleSubmit}>
                    Submit decisions
                </Button>
            </FooterBottom>
        </FooterBox>
    );
};

export default ApprovalFooter;
