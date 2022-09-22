import React, { useReducer, useMemo } from "react";
import debounce from "lodash.debounce";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import PackageList from "./PackageList";
import monohawkState from "./output.json";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1
    },
    content: {
        flexGrow: 1,
        height: "calc(100vh - 48px)",
        overflow: "auto"
    },

    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4)
    }
}));

export default function App() {
    const allDeps = useMemo(() => {
        return monohawkState.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
    }, []);

    const classes = useStyles();
    const [{ deps, filter }, setState] = useReducer((prev, next) => ({ ...prev, ...next }), {
        deps: allDeps,
        filter: ""
    });

    const filterPackages = useMemo(() => {
        return debounce((filter) => {
            const deps = filter ? allDeps.filter((pkg) => pkg.name.includes(filter)) : allDeps;
            setState({ deps });
        }, 200);
    }, [allDeps]);

    const applyFilter = (event) => {
        const filter = event.target.value;
        setState({ filter });
        filterPackages(filter);
    };

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <Typography variant="h5" color="inherit">
                        Monohawk
                    </Typography>
                </Toolbar>
            </AppBar>
            <main className={classes.content}>
                <Container maxWidth="lg" className={classes.container}>
                    <Grid container style={{ marginBottom: 20 }}>
                        <Grid item xs={4}>
                            <TextField
                                label="Filter packages"
                                fullWidth
                                value={filter}
                                onChange={applyFilter}
                            />
                        </Grid>
                        <Grid item xs={8} alignItems={"flex-end"}>
                            <Box display={"flex"} flexDirection={"row-reverse"}>
                                <Typography variant={"body1"}>
                                    Total packages: <strong>{deps.length}</strong>
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs={12}>
                            <PackageList packages={deps} />
                        </Grid>
                    </Grid>
                </Container>
            </main>
        </div>
    );
}
