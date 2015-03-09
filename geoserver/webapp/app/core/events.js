/*
 * (c) 2014 Boundless, http://boundlessgeo.com
 */
/**
 * Module containing global constants for the app.
 */
angular.module('gsApp.core.event', [])
.constant('AppEvent', {
  /**
   * Fired when app makes un-authorized request to backend
   */
  Unauthorized: 'app-auth-unauthorized',
  /**
   * Fired when user successfully logs in.
   */
  Login: 'app-login',
  /**
   * Fired on logout.
   */
  Logout: 'app-logout',
   /**
   * Fired when GeoServer is not responding.
   */
  ServerError: 'server-error',
  /**
   * Fired when sidenav resized.
   */
  SidenavResized: 'app-sidenav-resized',
  /**
   * Fired when sidenav resize is requested.
   */
  ToggleSidenav: 'toggle-sidenav',
    /**
   * Fired when a workspaces are fetched.
   */
  WorkspacesFetched: 'workspaces-fetched',
  /**
   * Fired when a workspace is selected.
   */
  WorkspaceSelected: 'workspaces-selected',
  /**
   * Fired when a workspace name is changed.
   */
  WorkspaceNameChanged: 'workspace-name-changed',
  /**
   * Fired when a new workspace is requested
   */
  CreateNewWorkspace: 'create-new-workspace',
  /**
   * Fired when a new workspace is created
   */
  WorkspaceTab: 'workspace-tab',
  /**
   * Fired when a workspace tab is requested
   */
  WorkspaceCreated: 'workspace-created',
  /**
   * Fired when a new workspace is requested
   */
  WorkspaceDeleted: 'workspace-deleted',
  /**
   * Fired when a new map is requested
   */
  CreateNewMap: 'create-new-map',
  /**
   * Fired when data import is requested
   */
  ImportData: 'import-data',
  /**
   * Fired when a single map's settings are updated
   */
  MapSettingsUpdated: 'map-settings-updated',
  /**
   * Fired when a map is edited
   */
  MapEdited: 'map-edited',
  /**
   * Fired when a map controls hide/show requested
   */
  MapControls: 'map-controls',
  /**
   * Fired when all maps are updated
   */
  MapsAllUpdated: 'maps-all-updated',
  /**
   * Fired when a map is added
   */
  MapAdded: 'map-added',
  /**
   * Fire when layers list in a workspace is updated
   */
  LayersAllUpdated: 'layers-all-updated',
   /**
   * Fire when a new layer is added
   */
  LayerAdded: 'layers-added',
  /**
   * Fire when custom projection is set
   */
  ProjSet: 'projection-set',
 /**
   * Fire when map background color change is requested
   */
  MapBackground: 'map-background'
});
