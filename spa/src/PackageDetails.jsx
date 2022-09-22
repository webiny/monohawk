import filesize from "filesize";
import React, { useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import FolderIcon from "@material-ui/icons/Folder";
import FitnessCenterIcon from "@material-ui/icons/FitnessCenter";
import InsertLinkIcon from "@material-ui/icons/InsertLink";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  }
}));

const PackageDetails = ({ dep }) => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const activeVersion = dep.versions[activeTab];
  const usedBy = dep.usedBy
    .filter((wp) => wp.version === activeVersion)
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  const stats = dep.sizes ? dep.sizes[activeVersion] : null;

  return (
    <div className={classes.root}>
      <Tabs value={activeTab} indicatorColor="primary" textColor="primary" onChange={handleChange}>
        {dep.versions.map((version) => (
          <Tab key={version} label={version} />
        ))}
      </Tabs>
      <Container>
        <Grid container>
          <Grid item xs={6}>
            <List subheader={<ListSubheader>Used in workspaces:</ListSubheader>}>
              {usedBy.map((wp) => (
                <ListItem key={wp.name + wp.type}>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText primary={wp.name} secondary={wp.location} />
                </ListItem>
              ))}
            </List>
          </Grid>
          {stats ? (
            <Grid item xs={6}>
              <List subheader={<ListSubheader>Package info:</ListSubheader>}>
                <ListItem>
                  <ListItemIcon>
                    <FitnessCenterIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span>Size: {filesize(stats.size)}</span>}
                    secondary={<span>GZip: {filesize(stats.gzip)}</span>}
                  />
                </ListItem>
                {stats.repository ? (
                  <ListItem>
                    <ListItemIcon>
                      <InsertLinkIcon />
                    </ListItemIcon>

                    <ListItemText
                      primary={"Repository"}
                      secondary={
                        <a rel="noreferrer" target="_blank" href={stats.repository}>
                          {stats.repository}
                        </a>
                      }
                    />
                  </ListItem>
                ) : null}
              </List>
            </Grid>
          ) : null}
        </Grid>
      </Container>
    </div>
  );
};

export default React.memo(PackageDetails);
