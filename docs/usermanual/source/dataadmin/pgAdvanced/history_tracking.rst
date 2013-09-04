.. _dataadmin.pgAdvanced.history_tracking:

Tracking edit history using triggers
====================================

A common requirement for production databases is the ability to track history—how has the data changed, who made the changes, and where did those changes occur? Although some GIS applications track changes by including change management in the client interface, it is also possible to implement tracking within a database, using the internal trigger system to track changes made to any table. This means simple *direct edit* access on the main table is retained, while history is tracked in the background.

To enable database edit history, a history table is created to record the following information for every edit:

  * If a record was created, when it was added and by whom.
  * If a record was deleted, when it was deleted and by whom.
  * If a record was updated, adding a deletion record for the old state and a creation record for the new state.

Building the history table
~~~~~~~~~~~~~~~~~~~~~~~~~~

Using the information in a history table, it is possible to reconstruct the state of the edited table at any point in time. To illustrate this feature, history tracking will be added to a table containing information on streets in New York city (**nyc_streets**).

  #. Create a new **nyc_streets_history** table as a copy of the **nyc_streets** table. This copy will store all the historical edit information. In addition to all the fields from **nyc_streets**, five extra fields will be added.

     * **hid**—Primary key for the history table
     * **created**—Date/time the history record was created
     * **created_by**—Database user who created the record
     * **deleted**—Date and time the history record was marked as deleted
     * **deleted_by**—Database user who marked the record as deleted

     Note that records are never deleted from the history table, they are simply flagged as deleted to mark the time they ceased to be part of the current state of the main table.

      .. code-block:: sql

       CREATE TABLE nyc_streets_history (
        hid SERIAL PRIMARY KEY,
        gid INTEGER,
        id FLOAT8,
        name VARCHAR(200),
        oneway VARCHAR(10),
        type VARCHAR(50),
        the_geom GEOMETRY,
        created TIMESTAMP,
        created_by VARCHAR(32),
        deleted TIMESTAMP,
        deleted_by VARCHAR(32)
    	 );

  #. Import the current state of the main table **nyc_streets** into the history table, as a starting point to trace history from. The creation time and creation user will be added, but the deletion records left as NULL, since all of the records are currently active.
  
     .. code-block:: sql

      INSERT INTO nyc_streets_history 
  	    (gid, id, name, oneway, type, the_geom, created, created_by)
  	    SELECT gid, id, name, oneway, type, the_geom, now(), current_user
  	      FROM nyc_streets;
	
  #. Create three triggers on the active table for INSERT, DELETE and UPDATE actions and then bind the triggers to the table. For an insert, add a new record into the history table with the creation time and user.

     .. code-block:: plpgsql

      CREATE OR REPLACE FUNCTION nyc_streets_insert() RETURNS trigger AS 
      $$
        BEGIN
          INSERT INTO nyc_streets_history 
            (gid, id, name, oneway, type, the_geom, created, created_by)
          VALUES
            (NEW.gid, NEW.id, NEW.name, NEW.oneway, NEW.type, NEW.the_geom,
             current_timestamp, current_user);
          RETURN NEW;
        END;
      $$ 
      LANGUAGE plpgsql;

      CREATE TRIGGER nyc_streets_insert_trigger
      AFTER INSERT ON nyc_streets
          FOR EACH ROW EXECUTE PROCEDURE nyc_streets_insert();
      

     For a deletion, mark the currently active history record (the one with a NULL deletion time) as deleted.

     .. code-block:: plpgsql

      CREATE OR REPLACE FUNCTION nyc_streets_delete() RETURNS trigger AS 
      $$
        BEGIN
          UPDATE nyc_streets_history 
            SET deleted = current_timestamp, deleted_by = current_user
            WHERE deleted IS NULL and gid = OLD.gid;
          RETURN NULL;
        END;
      $$ 
      LANGUAGE plpgsql;
      
      CREATE TRIGGER nyc_streets_delete_trigger
      AFTER DELETE ON nyc_streets
          FOR EACH ROW EXECUTE PROCEDURE nyc_streets_delete();
      

     For an update, mark the active history record as deleted, then insert a new record for the updated state.

     .. code-block:: plpgsql

      CREATE OR REPLACE FUNCTION nyc_streets_update() RETURNS trigger AS 
      $$
        BEGIN

          UPDATE nyc_streets_history 
            SET deleted = current_timestamp, deleted_by = current_user
            WHERE deleted IS NULL and gid = OLD.gid;

          INSERT INTO nyc_streets_history 
            (gid, id, name, oneway, type, the_geom, created, created_by)
          VALUES
            (NEW.gid, NEW.id, NEW.name, NEW.oneway, NEW.type, NEW.the_geom,
             current_timestamp, current_user);

          RETURN NEW;

        END;
      $$ 
      LANGUAGE plpgsql; 

      CREATE TRIGGER nyc_streets_update_trigger
      AFTER UPDATE ON nyc_streets
          FOR EACH ROW EXECUTE PROCEDURE nyc_streets_update();

  #. Test the history tracking by making some changes to the **nyc_streets** table. Each edit should result in new time-stamped and user-stamped records in the **nyc_streets_history** table, regardless of the edit tool or application used to make those changes.

     .. todo:: add some 'event' output


Querying the history table
~~~~~~~~~~~~~~~~~~~~~~~~~~

Database views can be used to track both the changes made to the main table, and the users making those changes.

To create a view of the history table that shows the state of the table before the current edit session began, execute the following (in this example the changes were made in the last hour):

.. code-block:: sql

  CREATE OR REPLACE VIEW nyc_streets_one_hour_ago AS
    SELECT * FROM nyc_streets_history
      WHERE created < (now() - '1hr'::interval)
      AND ( deleted IS NULL OR deleted > (now() - '1min'::interval) );

    
To create a view that tracks the changes made by a particular user (in this example, the *postgres* user), execute the following:

.. code-block:: sql

  CREATE OR REPLACE VIEW nyc_streets_postgres AS
    SELECT * FROM nyc_streets_history
      WHERE created_by = 'postgres';


