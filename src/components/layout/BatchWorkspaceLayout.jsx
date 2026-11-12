import React from 'react';
import { Outlet } from 'react-router-dom';
import { WorkspaceProvider } from '../../context/WorkspaceContext';

/**
 * Scopes the multi-file workspace to the batch tools only.
 *
 * Remove Metadata and View Metadata share this queue, so five files scanned in
 * one can be inspected in the other. Edit and Geo Tag sit outside it and are
 * deliberately single-photo tools — they cannot inherit a five-file batch, and
 * leaving this layout frees the in-memory ArrayBuffers.
 */
export default function BatchWorkspaceLayout() {
  return (
    <WorkspaceProvider>
      <Outlet />
    </WorkspaceProvider>
  );
}
